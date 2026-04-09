import { generateChatTitle, generateResponse } from "../Services/ai.service.js"
import chatModel from "../model/chatmodel.js"
import messageModel from "../model/messagemodel.js"


export async function sendMessage(req, res) {
  try {
    const { message, chatId } = req.body;
    const imageFile = req.file || null;

    console.log("IMAGE FILE RECEIVED:", imageFile ? "YES" : "NO");

    let currentChatId = chatId;

    if (!chatId) {
      const title = await generateChatTitle(message || "Image Upload");
      const chat = await chatModel.create({ user: req.user.id, title });
      currentChatId = chat._id;
    }

    // Save user message (Handle text or image placeholder)
    const userMsgContent = imageFile ? (message || "Sent an image") : message;

    await messageModel.create({
      chat: currentChatId,
      content: userMsgContent,
      role: "user",
      image: imageFile ? imageFile.buffer.toString("base64") : null
      // Optional: if you add an 'image' field to your schema:
      // image: imageFile ? imageFile.buffer.toString('base64') : null 
    });

    const messages = await messageModel.find({ chat: currentChatId })
      .sort({ createdAt: 1 })
      .limit(10)
      .lean();

    const orderedMessages = messages;


    // Pass the image buffer to your AI service
    const result = await generateResponse(
      orderedMessages,
      imageFile || undefined
    );

    await messageModel.create({
      chat: currentChatId,
      content: result,
      role: "ai"
    });

    const updatedMessages = await messageModel.find({ chat: currentChatId }).sort({ createdAt: 1 });
    const updatedChat = await chatModel.findById(currentChatId);

    res.status(200).json({
      message: "Response generated",
      data: result,
      chatId: currentChatId,
      title: updatedChat.title,
      messages: updatedMessages.map(m => ({
        _id: m._id,
        content: m.content,
        role: m.role,
        image: m.image || null   // 👈 ADD THIS
      }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}



export async function getChat(req, res) {

  const user = req.user
  const chats = await chatModel.find({
    user: user.id
  })

  res.status(200).json({
    message: "chat retrived successfully", chats
  })
}


export async function getMessage(req, res) {
  const { chatId } = req.params;

  const chat = await chatModel.findOne({
    _id: chatId,
    user: req.user.id
  });

  if (!chat) {
    return res.status(404).json({
      message: "chat not found"
    });
  }

  const messages = await messageModel.find({
    chat: chatId
  });

  res.status(200).json({
    message: "message retrieved successfully",
    messages
  });
}


export async function deletechat(req, res) {
  const { chatId } = req.params;

  const chat = await chatModel.findOneAndDelete({
    _id: chatId,
    user: req.user.id
  });

  if (!chat) {
    return res.status(404).json({
      message: "chat not found"
    });
  }

  await messageModel.deleteMany({
    chat: chatId
  });

  res.status(200).json({
    message: "chat deleted"
  });
}

export const deleteMessage = async (req, res) => {
  try {
    const { chatId, messageId } = req.params;

    // 🔒 verify chat ownership
    const chat = await chatModel.findOne({
      _id: chatId,
      user: req.user.id
    });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // 📩 get messages ordered
    const messages = await messageModel
      .find({ chat: chatId })
      .sort({ createdAt: 1 });

    const index = messages.findIndex(
      (m) => m._id.toString() === messageId
    );

    if (index === -1) {
      return res.status(404).json({ message: "Message not found" });
    }

    const deleteIds = [];

    const target = messages[index];
    deleteIds.push(target._id);

    // 🤖 delete AI pair if user message
    if (target.role === "user") {
      const next = messages[index + 1];
      if (next && next.role === "ai") {
        deleteIds.push(next._id);
      }
    }

    await messageModel.deleteMany({
      _id: { $in: deleteIds }
    });

    // 💥 check if chat empty
    const remaining = await messageModel.countDocuments({
      chat: chatId
    });

    if (remaining === 0) {
      await chatModel.findByIdAndDelete(chatId);
    }

    const updatedMessages = await messageModel
      .find({ chat: chatId })
      .sort({ createdAt: 1 });

    res.status(200).json({
      message: "Deleted successfully",
      messages: updatedMessages,
      chatDeleted: remaining === 0
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};



export const renameChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const chat = await chatModel.findByIdAndUpdate(
      chatId,
      { title },
      { new: true }
    );

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    res.json(chat);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const editMessage = async (req, res) => {
  try {
    const { chatId, messageId } = req.params;
    const { message: newContent } = req.body;

    // 1. Find the message being edited
    const userMsg = await messageModel.findById(messageId);
    if (!userMsg) return res.status(404).json({ error: "Message not found" });

    // 2. Update the user message content
    userMsg.content = newContent;
    await userMsg.save();

    // 3. IMPORTANT: Delete any AI response that immediately followed this message
    // Because the old AI response is now irrelevant
    await messageModel.deleteMany({
      chat: chatId,
      createdAt: { $gt: userMsg.createdAt }
    });

    // 4. Get remaining history to generate new response
    const history = await messageModel.find({ chat: chatId }).sort({ createdAt: 1 });

    // 5. Generate NEW AI Response
    const aiResponseContent = await generateResponse(history);

    // 6. Save NEW AI Message
    const newAiMsg = await messageModel.create({
      chat: chatId,
      content: aiResponseContent,
      role: "ai"
    });

    // 7. Return all updated messages to frontend
    const allMessages = await messageModel.find({ chat: chatId }).sort({ createdAt: 1 });
    res.status(200).json({ messages: allMessages });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Edit failed" });
  }
};