export const initializeSocketConnection = () => {
    const socket = io("https://chatgpt-clone-jffg.onrender.com", {
        withCredentials: true // ✅ FIXED
    });

    socket.on("connect", () => {
        console.log("connected to socket.IO");
    });
};