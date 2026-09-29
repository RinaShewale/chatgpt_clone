import { generateChatTitle, generateResponse } from "../Services/ai.service.js";
import chatModel from "../model/chatmodel.js";
import messageModel from "../model/messagemodel.js";


// ======================================================
// SEND MESSAGE
// ======================================================

export async function sendMessage(req, res) {
  try {
    const { message, chatId } = req.body;
    const imageFile = req.file || null;

    console.log(
      "IMAGE FILE RECEIVED:",
      imageFile ? "YES" : "NO"
    );

    let currentChatId = chatId;


    // ==================================================
    // 1. CREATE NEW CHAT
    // ==================================================

    if (!chatId) {
      let title = "New Chat";

      try {
        title = await generateChatTitle(
          message || "Image Upload"
        );

        if (!title || typeof title !== "string") {
          title = "New Chat";
        }

        // Remove unnecessary quotes if AI returns them
        title = title
          .replace(/^["']|["']$/g, "")
          .trim();

      } catch (error) {
        console.error(
          "Chat title generation failed:",
          error
        );

        title = "New Chat";
      }


      const chat = await chatModel.create({
        user: req.user.id,
        title: title || "New Chat"
      });

      currentChatId = chat._id;
    }


    // ==================================================
    // 2. VERIFY CHAT EXISTS + USER OWNS CHAT
    // ==================================================

    const currentChat = await chatModel.findOne({
      _id: currentChatId,
      user: req.user.id
    });

    if (!currentChat) {
      return res.status(404).json({
        message: "Chat not found"
      });
    }


    // ==================================================
    // 3. SAVE USER MESSAGE
    // ==================================================

    const userMsgContent = imageFile
      ? (message || "Sent an image")
      : (message || "");


    await messageModel.create({
      chat: currentChatId,
      content: userMsgContent,
      role: "user",

      image: imageFile
        ? imageFile.buffer.toString("base64")
        : null
    });


    // ==================================================
    // 4. GET CHAT HISTORY
    // ==================================================

    const messages = await messageModel
      .find({
        chat: currentChatId
      })
      .sort({
        createdAt: 1
      })
      .limit(10)
      .lean();


    // ==================================================
    // 5. GENERATE AI RESPONSE
    // ==================================================

    let result;

    try {
      result = await generateResponse(
        messages,
        imageFile || undefined
      );

    } catch (aiError) {

      console.error(
        "AI GENERATION ERROR:",
        aiError
      );

      return res.status(503).json({
        message:
          "AI service is temporarily unavailable. Please try again later.",
        chatId: currentChatId
      });
    }


    // ==================================================
    // 6. CHECK AI RESPONSE
    // ==================================================

    if (
      !result ||
      typeof result !== "string" ||
      !result.trim()
    ) {
      return res.status(503).json({
        message:
          "AI service did not return a response.",
        chatId: currentChatId
      });
    }


    // ==================================================
    // 7. SAVE AI MESSAGE
    // ==================================================

    await messageModel.create({
      chat: currentChatId,
      content: result,
      role: "ai"
    });


    // ==================================================
    // 8. GET UPDATED MESSAGES
    // ==================================================

    const updatedMessages = await messageModel
      .find({
        chat: currentChatId
      })
      .sort({
        createdAt: 1
      });


    // ==================================================
    // 9. GET UPDATED CHAT
    // ==================================================

    const updatedChat = await chatModel.findOne({
      _id: currentChatId,
      user: req.user.id
    });


    // ==================================================
    // 10. EXTRA SAFETY CHECK
    // ==================================================

    if (!updatedChat) {
      return res.status(404).json({
        message: "Chat no longer exists"
      });
    }


    // ==================================================
    // 11. SEND RESPONSE TO FRONTEND
    // ==================================================

    return res.status(200).json({
      message: "Response generated",

      data: result,

      chatId: currentChatId,

      title: updatedChat.title || "New Chat",

      messages: updatedMessages.map((m) => ({
        _id: m._id,
        content: m.content,
        role: m.role,
        image: m.image || null
      }))
    });


  } catch (err) {

    console.error(
      "SEND MESSAGE ERROR:",
      err
    );

    return res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
}



// ======================================================
// GET ALL CHATS
// ======================================================

export async function getChat(req, res) {

  try {

    const user = req.user;

    const chats = await chatModel.find({
      user: user.id
    });

    return res.status(200).json({
      message: "chat retrieved successfully",
      chats
    });

  } catch (error) {

    console.error(
      "GET CHAT ERROR:",
      error
    );

    return res.status(500).json({
      message: "Server error"
    });
  }
}



// ======================================================
// GET MESSAGES
// ======================================================

export async function getMessage(req, res) {

  try {

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


    return res.status(200).json({
      message: "message retrieved successfully",
      messages
    });


  } catch (error) {

    console.error(
      "GET MESSAGE ERROR:",
      error
    );

    return res.status(500).json({
      message: "Server error"
    });
  }
}



// ======================================================
// DELETE CHAT
// ======================================================

export async function deletechat(req, res) {

  try {

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


    return res.status(200).json({
      message: "chat deleted"
    });


  } catch (error) {

    console.error(
      "DELETE CHAT ERROR:",
      error
    );

    return res.status(500).json({
      message: "Server error"
    });
  }
}



// ======================================================
// DELETE MESSAGE
// ======================================================

export const deleteMessage = async (req, res) => {

  try {

    const {
      chatId,
      messageId
    } = req.params;


    // Verify chat ownership
    const chat = await chatModel.findOne({
      _id: chatId,
      user: req.user.id
    });


    if (!chat) {
      return res.status(404).json({
        message: "Chat not found"
      });
    }


    // Get messages
    const messages = await messageModel
      .find({
        chat: chatId
      })
      .sort({
        createdAt: 1
      });


    const index = messages.findIndex(
      (m) =>
        m._id.toString() === messageId
    );


    if (index === -1) {
      return res.status(404).json({
        message: "Message not found"
      });
    }


    const deleteIds = [];


    const target = messages[index];

    deleteIds.push(target._id);


    // If user message, delete following AI response
    if (target.role === "user") {

      const next = messages[index + 1];

      if (
        next &&
        next.role === "ai"
      ) {
        deleteIds.push(next._id);
      }
    }


    await messageModel.deleteMany({
      _id: {
        $in: deleteIds
      }
    });


    // Check if chat is empty
    const remaining =
      await messageModel.countDocuments({
        chat: chatId
      });


    if (remaining === 0) {

      await chatModel.findByIdAndDelete(
        chatId
      );

      return res.status(200).json({
        message: "Deleted successfully",
        messages: [],
        chatDeleted: true
      });
    }


    // Get updated messages
    const updatedMessages =
      await messageModel
        .find({
          chat: chatId
        })
        .sort({
          createdAt: 1
        });


    return res.status(200).json({
      message: "Deleted successfully",
      messages: updatedMessages,
      chatDeleted: false
    });


  } catch (err) {

    console.error(
      "DELETE MESSAGE ERROR:",
      err
    );

    return res.status(500).json({
      message: "Server error"
    });
  }
};



// ======================================================
// RENAME CHAT
// ======================================================

export const renameChat = async (req, res) => {

  try {

    const { chatId } = req.params;

    const { title } = req.body;


    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Title is required"
      });
    }


    const chat =
      await chatModel.findOneAndUpdate(

        {
          _id: chatId,
          user: req.user.id
        },

        {
          title: title.trim()
        },

        {
          new: true
        }
      );


    if (!chat) {
      return res.status(404).json({
        message: "Chat not found"
      });
    }


    return res.json(chat);


  } catch (err) {

    console.error(
      "RENAME CHAT ERROR:",
      err
    );

    return res.status(500).json({
      message: err.message
    });
  }
};



// ======================================================
// EDIT MESSAGE
// ======================================================

export const editMessage = async (req, res) => {

  try {

    const {
      chatId,
      messageId
    } = req.params;


    const {
      message: newContent
    } = req.body;


    if (
      !newContent ||
      !newContent.trim()
    ) {
      return res.status(400).json({
        message: "Message is required"
      });
    }


    // ==================================================
    // 1. VERIFY CHAT OWNERSHIP
    // ==================================================

    const chat = await chatModel.findOne({
      _id: chatId,
      user: req.user.id
    });


    if (!chat) {
      return res.status(404).json({
        message: "Chat not found"
      });
    }


    // ==================================================
    // 2. FIND MESSAGE
    // ==================================================

    const userMsg =
      await messageModel.findOne({
        _id: messageId,
        chat: chatId,
        role: "user"
      });


    if (!userMsg) {
      return res.status(404).json({
        message: "Message not found"
      });
    }


    // ==================================================
    // 3. UPDATE USER MESSAGE
    // ==================================================

    userMsg.content =
      newContent.trim();

    await userMsg.save();


    // ==================================================
    // 4. DELETE OLD AI RESPONSES
    // ==================================================

    await messageModel.deleteMany({
      chat: chatId,

      createdAt: {
        $gt: userMsg.createdAt
      }
    });


    // ==================================================
    // 5. GET UPDATED HISTORY
    // ==================================================

    const history =
      await messageModel
        .find({
          chat: chatId
        })
        .sort({
          createdAt: 1
        });


    // ==================================================
    // 6. GENERATE NEW AI RESPONSE
    // ==================================================

    let aiResponseContent;

    try {

      aiResponseContent =
        await generateResponse(history);

    } catch (error) {

      console.error(
        "EDIT AI ERROR:",
        error
      );

      return res.status(503).json({
        message:
          "AI service is temporarily unavailable"
      });
    }


    if (
      !aiResponseContent ||
      !aiResponseContent.trim()
    ) {
      return res.status(503).json({
        message:
          "AI service did not return a response"
      });
    }


    // ==================================================
    // 7. SAVE NEW AI MESSAGE
    // ==================================================

    await messageModel.create({
      chat: chatId,
      content: aiResponseContent,
      role: "ai"
    });


    // ==================================================
    // 8. RETURN UPDATED MESSAGES
    // ==================================================

    const allMessages =
      await messageModel
        .find({
          chat: chatId
        })
        .sort({
          createdAt: 1
        });


    return res.status(200).json({
      messages: allMessages
    });


  } catch (error) {

    console.error(
      "EDIT MESSAGE ERROR:",
      error
    );

    return res.status(500).json({
      error: "Edit failed"
    });
  }
};