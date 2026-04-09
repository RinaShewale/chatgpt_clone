import express from "express";
import { handleVoiceInteraction } from "../controller/voice.controller.js";
import { authUser } from "../middleware/auth.middleware.js"; // 👈 Import your middleware

const voiceRouter = express.Router();

// Apply authUser here so req.user is available in the controller
voiceRouter.post("/voice-interaction", authUser, handleVoiceInteraction);

export default voiceRouter;