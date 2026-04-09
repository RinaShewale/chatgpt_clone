import axios from "axios";

const api = axios.create({
    baseURL: "https://chatgpt-clone-jffg.onrender.com",
    withCredentials: true
});

// ================= SEND MESSAGE =================
export const sendMessage = async ({ message, chatId, image }) => {
    const formData = new FormData();
    formData.append("message", message);

    if (chatId) {
        formData.append("chatId", chatId);
    }

    if (image) {
        formData.append("image", image);
    }

    const response = await api.post("/api/chats/message", formData);

    return response.data;
};



// ================= GET CHATS =================
export const getChats = async () => {
    const response = await api.get("/api/chats");
    return response.data;
};

// ================= GET MESSAGES =================
export const getMessages = async (chatId) => {
    if (!chatId) throw new Error("chatId is required");

    const res = await api.get(`/api/chats/${chatId}/messages`);
    return res.data;
};


// ================= DELETE CHAT =================
export const deleteChat = async (chatId) => {
    const response = await api.delete(`/api/chats/delete/${chatId}`);
    return response.data;
};


// ================= DELETE MESSAGE =================
export const deleteMessage = async (chatId, messageId) => {
    const res = await api.delete(
        `/api/chats/${chatId}/messages/${messageId}`
    );

    return res.data;
};


//================ rename title (NEW)===================
export const renameChat = async (chatId, title) => {
    const response = await api.patch(`/api/chats/${chatId}`, {
        title
    });

    return response.data;
};




//================ EDIT MESSAGE (NEW)===================

export const editMessage = async (chatId, messageId, message) => {
    const res = await api.patch(
        `/api/chats/${chatId}/messages/${messageId}`,
        { message }   // 👈 IMPORTANT KEY MATCH BACKEND
    );

    return res.data;
};



// src/feature/chat/services/chat.api.js

export const sendVoiceMessageApi = async ({ text, chatId }) => {
    const response = await api.post("/api/ai/voice-interaction", {
        text,
        chatId
    });

    return response.data;
};