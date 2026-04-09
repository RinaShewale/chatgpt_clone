import { Router } from "express"
import { sendMessage, getChat, getMessage, deletechat, deleteMessage, renameChat, editMessage } from "../controller/chatcontroller.js"
import { authUser } from "../middleware/auth.middleware.js"
import multer from "multer";
const upload = multer({ storage: multer.memoryStorage() });


const chatRouter = Router()

chatRouter.post("/message", authUser, upload.single("image"), sendMessage);

chatRouter.get("/", authUser, getChat)

chatRouter.get("/:chatId/messages", authUser, getMessage)

chatRouter.delete("/delete/:chatId", authUser, deletechat)

chatRouter.delete("/:chatId/messages/:messageId", authUser, deleteMessage);

chatRouter.patch("/:chatId/messages/:messageId", authUser, editMessage);

chatRouter.patch("/:chatId", authUser, renameChat);


export default chatRouter