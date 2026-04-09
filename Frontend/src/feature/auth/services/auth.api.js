import axios from "axios";

const api = axios.create({
  baseURL: "https://chatgpt-clone-jffg.onrender.com",
  withCredentials: true
});

// 🔥 THE FIX: Add an interceptor to attach the token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    // This adds "Authorization: Bearer <your_token>" to every request
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export async function register({ email, username, password }) {
  const response = await api.post("/api/auth/register", { email, username, password });
  return response.data;
}

export async function login({ email, password }) {
  const response = await api.post("/api/auth/login", { email, password });
  return response.data;
}

export async function getme() {
  // This will now send the token automatically thanks to the interceptor
  const response = await api.get("/api/auth/getme");
  return response.data;
}

export async function updateProfile(updateData) {
  const response = await api.patch("/api/auth/update", updateData);
  return response.data;
}

export async function logout() {
  const response = await api.get("/api/auth/logout");
  return response.data;
}

export async function updatePassword(passwordData) {
  // This sends { oldPassword, newPassword } to your backend
  const response = await api.patch("/api/auth/update-password", passwordData);
  return response.data;
}


// services/auth.api.js

export const forgotPassword = async (email) => {
    const response = await api.post("/api/auth/forgot-password", { email });
    return response.data;
};

export const resetPassword = async (token, newPassword) => {
    const response = await api.post("/api/auth/reset-password", { token, newPassword });
    return response.data;
};