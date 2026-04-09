export const initializeSocketConnection = () => {
    const socket = io("https://perplexity-58ov.onrender.com", {
        withCredentials: true // ✅ FIXED
    });

    socket.on("connect", () => {
        console.log("connected to socket.IO");
    });
};