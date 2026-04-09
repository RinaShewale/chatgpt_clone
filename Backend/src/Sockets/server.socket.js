import { Server } from "socket.io"

let io;

export function initSocket(httpServer) {
    io = new Server(httpServer, {
        cors: {
            origin: true,
            credentials: true
        }
    });

    console.log("✅ socket.io is running");

    io.on("connection", (socket) => {
        console.log("A user connected:", socket.id);

        socket.on("disconnect", () => {
            console.log(" User disconnected:", socket.id);
        });
    });
}

export function getIO() {
    if (!io) {
        throw new Error("socket.io not initialized");
    }
    return io;
}