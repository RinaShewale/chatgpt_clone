import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
    name: "chat",
    initialState: {
        chats: {},
        currentChatId: null,
        currentChat: null,
        loading: false,
        error: null
    },

    reducers: {

        // ================= SET ALL CHATS =================
        setChats: (state, action) => {
            state.chats = action.payload;
        },

        // ================= SET CURRENT CHAT =================
        setCurrentChatId: (state, action) => {
            state.currentChatId = action.payload;
        },

        setCurrentChat: (state, action) => {
            state.currentChat = action.payload;
        },

        // ================= LOADING / ERROR =================
        setLoading: (state, action) => {
            state.loading = action.payload;
        },

        setError: (state, action) => {
            state.error = action.payload;
        },

        // ================= UPDATE CHAT (GENERIC) =================
        updateChat: (state, action) => {
            const { chatId, updates } = action.payload;

            if (state.chats[chatId]) {
                state.chats[chatId] = {
                    ...state.chats[chatId],
                    ...updates
                };
            }
        },

        // ================= UPDATE CHAT TITLE (RENAME FIX) =================
        updateChatTitle: (state, action) => {
            const { chatId, title } = action.payload;

            if (state.chats[chatId]) {
                state.chats[chatId].title = title;
                state.chats[chatId].lastUpdated = new Date().toISOString();
            }
        },

        // ================= UPDATE MESSAGES =================
        updateChatMessages: (state, action) => {
            const { chatId, messages } = action.payload;

            if (state.chats[chatId]) {
                state.chats[chatId].messages = messages;
            }
        },

        // ================= REMOVE CHAT =================
        removeChat: (state, action) => {
            const chatId = action.payload;
            delete state.chats[chatId];
        },

        // ================= ADD MESSAGE (optional but useful) =================
        addMessage: (state, action) => {
            const { chatId, message } = action.payload;

            if (state.chats[chatId]) {
                state.chats[chatId].messages.push(message);
            }
        }
    }
});

export const {
    setChats,
    setCurrentChatId,
    setCurrentChat,
    setLoading,
    setError,
    updateChat,
    updateChatTitle,
    updateChatMessages,
    removeChat,
    addMessage
} = chatSlice.actions;

export default chatSlice.reducer;