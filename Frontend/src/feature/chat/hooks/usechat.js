import { useDispatch, useSelector } from "react-redux";
import {
    setChats,
    setLoading,
    setError,
    setCurrentChatId,
    updateChatMessages,
    updateChatTitle,
    setCurrentChat

} from "../chat.slice";

import {
    sendMessage,
    getChats,
    getMessages,
    deleteChat,
    deleteMessage,
    editMessage,
    renameChat,
    sendVoiceMessageApi
} from "../services/chat.api";

export function useChat() {
    const dispatch = useDispatch();
    const { chats, currentChatId } = useSelector((state) => state.chat);

    // ================= GET ALL CHATS =================
    const handleGetChats = async () => {
        try {
            dispatch(setLoading(true));

            const data = await getChats();
            const { chats: chatList } = data;

            // ✅ SORT LATEST FIRST
            const sortedChats = chatList.sort(
                (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
            );

            const formatted = sortedChats.reduce((acc, chat) => {
                acc[chat._id] = {
                    id: chat._id,
                    title: chat.title,
                    messages: [],
                    lastUpdated: chat.updatedAt
                };
                return acc;
            }, {});

            dispatch(setChats(formatted));

        } catch (err) {
            dispatch(setError("Failed to fetch chats"));
        } finally {
            dispatch(setLoading(false));
        }
    };

    // ================= OPEN CHAT =================
    const handleOpenChat = async (chatId) => {
        try {
            dispatch(setLoading(true));
            const data = await getMessages(chatId);
            const { messages } = data;

            const formatted = messages.map(m => ({
                _id: m._id,
                content: m.content,
                role: m.role,
                createdAt: m.createdAt,
                image: m.image // ✅ ADD THIS LINE: This keeps the image in Redux
            }));

            dispatch(setChats({
                ...chats,
                [chatId]: {
                    id: chatId,
                    title: chats?.[chatId]?.title || "Chat",
                    messages: formatted,
                    lastUpdated: new Date().toISOString()
                }
            }));
            dispatch(setCurrentChatId(chatId));
        } catch (err) {
            dispatch(setError("Failed to open chat"));
        } finally {
            dispatch(setLoading(false));
        }
    };

    // ================= SEND MESSAGE =================
    const handleSendMessage = async (message, image = null) => {
        try {
            dispatch(setLoading(true));
            const res = await sendMessage({ message, chatId: currentChatId, image });
            const { chatId: finalChatId, title, messages } = res;

            const updatedChats = {
                ...chats,
                [finalChatId]: {
                    id: finalChatId,
                    title: title || (chats[finalChatId]?.title),
                    lastUpdated: new Date().toISOString(),
                    messages: messages.map(m => ({
                        _id: m._id,
                        content: m.content,
                        role: m.role,
                        image: m.image // ✅ ADD THIS LINE: This ensures the new message shows the image
                    }))
                }
            };
            dispatch(setChats(updatedChats));
            dispatch(setCurrentChatId(finalChatId));
        } catch (err) {
            dispatch(setError("Message send failed"));
        } finally {
            dispatch(setLoading(false));
        }
    };

    const handleDeleteChat = async (chatId) => {
        try {
            dispatch(setLoading(true));

            console.log("Deleting chat:", chatId);

            await deleteChat(chatId);

            const updatedChats = { ...chats };
            delete updatedChats[chatId];

            dispatch(setChats(updatedChats));

            if (currentChatId === chatId) {
                dispatch(setCurrentChatId(null));
            }

        } catch (err) {
            console.log("Delete failed:", err);
            dispatch(setError("Delete failed"));
        } finally {
            dispatch(setLoading(false));
        }
    };

    // const handleDeleteMessage = async (chatId, messageId) => {
    //     try {
    //         const data = await deleteMessage(chatId, messageId);


    //         const updatedMessages = data.messages;

    //         const updatedChats = {
    //             ...chats,
    //             [chatId]: {
    //                 ...chats[chatId],
    //                 messages: updatedMessages,
    //                 lastUpdated: new Date().toISOString()
    //             }
    //         };

    //         // 💥 IF CHAT EMPTY → REMOVE FROM SIDEBAR
    //         if (updatedMessages.length === 0) {
    //             const newChats = { ...updatedChats };
    //             delete newChats[chatId];

    //             dispatch(setChats(newChats));

    //             if (currentChatId === chatId) {
    //                 dispatch(setCurrentChatId(null));
    //             }

    //             return;
    //         }

    //         dispatch(setChats(updatedChats));

    //     } catch (err) {
    //         console.log("Delete message error", err);
    //     }
    // };


    const handleDeleteMessage = async (chatId, messageId) => {
        try {
            const res = await deleteMessage(chatId, messageId);

            const updatedMessages = res.messages;

            const existingChat = chats[chatId];

            const updatedChats = {
                ...chats,
                [chatId]: {
                    ...existingChat,
                    messages: updatedMessages
                }
            };

            dispatch(setChats(updatedChats));

            if (currentChatId === chatId) {
                dispatch(setCurrentChatId(chatId));
            }

        } catch (err) {
            console.log(err);
        }
    };


    // ================= RENAME CHAT =================
    const handleRenameChat = async (chatId, title) => {
        try {
            const res = await renameChat(chatId, title);

            dispatch(setChats({
                ...chats,
                [chatId]: {
                    ...chats[chatId],
                    title: res.title
                }
            }));

        } catch (err) {
            console.log(err);
        }
    };

    // ================= EDIT MESSAGE =================
    const handleEditMessage = async (chatId, messageId, message) => {
        try {
            await editMessage(chatId, messageId, message);

            const data = await getMessages(chatId);

            dispatch(setChats({
                ...chats,
                [chatId]: {
                    ...chats[chatId],
                    messages: data.messages
                }
            }));

        } catch (err) {
            console.log("Edit message error:", err);
        }
    };




    // Inside your useChat.js hook

    const speakText = (text) => {
        if (!text) return;

        // 1. Cancel any current speech
        window.speechSynthesis.cancel();

        // 2. Create the utterance
        const utterance = new SpeechSynthesisUtterance(text);

        // 3. Robust Voice Selection
        const setVoiceAndSpeak = () => {
            const voices = window.speechSynthesis.getVoices();
            // Try to find a high-quality English voice
            const selectedVoice =
                voices.find(v => v.name.includes("Google") && v.lang.includes("en-US")) ||
                voices.find(v => v.lang.startsWith("en-US")) ||
                voices.find(v => v.lang.startsWith("en")) ||
                voices[0];

            if (selectedVoice) {
                utterance.voice = selectedVoice;
            }

            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;

            console.log("TTS Triggered:", text.slice(0, 40));
            window.speechSynthesis.speak(utterance);
        };

        // 4. Critical Fix: Voices load async in browsers
        if (window.speechSynthesis.getVoices().length === 0) {
            window.speechSynthesis.onvoiceschanged = setVoiceAndSpeak;
        } else {
            setVoiceAndSpeak();
        }
    };



    const handleVoiceInteraction = async (text) => {
        try {
            dispatch(setLoading(true));

            // Handle "new chat" placeholder
            const safeId = (currentChatId === "new_chat_id" || !currentChatId) ? null : currentChatId;

            const res = await sendVoiceMessageApi({ text, chatId: safeId });

            const { chatId: targetChatId, title, messages, aiResponse } = res;

            // Update the Redux Chats object
            const updatedChats = { ...chats };

            // Remove the temporary "New chat" entry if it exists
            if (updatedChats["new_chat_id"]) delete updatedChats["new_chat_id"];

            // Update/Add the specific chat with the AI-generated title
            updatedChats[targetChatId] = {
                _id: targetChatId,
                id: targetChatId,
                title: title, // 👈 This is the 2-4 word title from generateChatTitle
                messages: [
                    ...(chats[targetChatId]?.messages || []),
                    ...messages
                ],
                lastUpdated: new Date().toISOString()
            };

            dispatch(setChats(updatedChats));
            dispatch(setCurrentChatId(targetChatId));

            if (aiResponse) {
                speakText(aiResponse);
            }

        } catch (err) {
            console.error("Voice Sidebar update error:", err);
        } finally {
            dispatch(setLoading(false));
        }
    };




    return {
        chats,
        currentChatId,
        handleGetChats,
        handleOpenChat,
        handleSendMessage,
        handleDeleteChat,
        handleDeleteMessage,
        handleEditMessage,
        handleRenameChat,
        handleVoiceInteraction,
        speakText,

    };
}