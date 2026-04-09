import dotenv from "dotenv";
dotenv.config();
import http from "http"
import { initSocket } from "./src/Sockets/server.socket.js"


import app from "./src/app.js";
import { connectDB } from "./src/config/database.js"

const PORT = process.env.PORT || 3000;
const httpServer=http.createServer(app)

initSocket(httpServer)

connectDB()


httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
});

