import { generateResponse, generateChatTitle } from "../Services/ai.service.js"; // 👈 Import title function
import chatModel from "../model/chatmodel.js";
import messageModel from "../model/messagemodel.js";

export const handleVoiceInteraction = async (req, res) => {
    try {
        const { text, chatId } = req.body;
        const userId = req.user?._id || req.user?.id;

        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        let chat;

        // 1. Find or Create the Chat
        if (chatId && chatId !== "new_chat_id" && chatId.length === 24) {
            chat = await chatModel.findOne({ _id: chatId, user: userId });
        }

        if (!chat) {
            // 2. USE YOUR AI TITLE GENERATOR
            const aiTitle = await generateChatTitle(text);
            const cleanTitle = aiTitle.replace(/"/g, "").trim(); // Remove quotes if AI adds them

            chat = await chatModel.create({
                user: userId,
                title: cleanTitle // 👈 Now stores the 2-4 word summary
            });
        }

        // 3. Generate AI Response for the conversation
        const aiContent = await generateResponse([{ role: "user", content: text }]);
        const responseString = typeof aiContent === "string" ? aiContent : aiContent?.content;

        // 4. Save messages to DB using messageModel
        const savedMessages = await messageModel.insertMany([
            { chat: chat._id, content: text, role: "user" },
            { chat: chat._id, content: responseString, role: "ai" }
        ]);

        // 5. Update chat timestamp
        chat.updatedAt = new Date();
        await chat.save();

        // 6. Return response to frontend
        res.status(200).json({
            chatId: chat._id,
            title: chat.title, // 👈 Sends the AI generated title back
            aiResponse: responseString,
            messages: savedMessages
        });

    } catch (error) {
        console.error("VOICE ERROR:", error);
        res.status(500).json({ error: "Voice processing failed" });
    }
};