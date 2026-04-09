import express from "express"
import cookieparser from "cookie-parser"
import morgan from "morgan"
import cors from "cors"
import path from "path"
import { fileURLToPath } from "url"

// routes
import authRouter from "./routes/authrouter.js"
import chatRouter from "./routes/chatroute.js"
import voiceRouter from "./routes/ai.route.js"
// ... (your imports remain the same)

const app = express()

// Middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieparser())
app.use(morgan("dev"))

app.use(
  cors({
    origin: "https://chatgpt-clone-jffg.onrender.com",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
)

// ======================
// API ROUTES
// ======================
// REMOVE the app.get("/") route from here if you want the frontend to show at the root URL

app.use("/api/auth", authRouter)
app.use("/api/chats", chatRouter)
app.use("/api/ai", voiceRouter)

app.get("/api/auth/google/callback", (req, res) => {
  res.send("OAuth callback received")
})

// ======================
// FRONTEND DIST SETUP
// ======================

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 1. Correct the path: go up TWO levels (src -> Backend -> Root)
const frontendPath = path.join(__dirname, "../../Frontend/dist")

// 2. Serve static files
app.use(express.static(frontendPath))

// 3. React fallback route (Fix the "*" selector)
app.get("*name", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"))
})

export default app