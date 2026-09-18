import { Request, Response } from "express";
import { processChatMessageService } from "./chat.service";
import { ChatMessage } from "./chatHistory.model";
import { User } from "../../../models/user/user.model";

export const handleChatMessage = async (req: Request, res: Response) => {
  try {
    const { message, userFrequentCategory, userId, email } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    let databaseUserId: string | undefined = undefined;

    // 🎯 ১. ডাটাবেজ থেকে User Collection এ সার্চ করা
    if (userId) {
      // যদি ID পাঠানো হয়ে থাকে
      const dbUser = await User.findById(userId);
      if (dbUser) {
        databaseUserId = String(dbUser._id);
      }
    } else if (email) {
      // যদি Email পাঠানো হয়ে থাকে
      const dbUser = await User.findOne({ email });
      if (dbUser) {
        databaseUserId = String(dbUser._id);
      }
    }

    // 🎯 ২. সার্ভিস লেয়ারে ডাটাবেজ থেকে পাওয়া _id পাঠানো
    const result = await processChatMessageService({
      message,
      userFrequentCategory,
      userId: databaseUserId,
    });

    return res.status(200).json({
      success: true,
      message: "Chat response generated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Chat Controller Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process chat message",
    });
  }
};

// GET: /api/v1/chat/history/:userId
export const getChatHistory = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // শেষ ৫০টি মেসেজ সময়ের ক্রমানুসারে নিয়ে আসা
    const history = await ChatMessage.find({ userId }).sort({ createdAt: 1 }); // পুরনো থেকে নতুন সাজানো

    return res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "History fetch failed", error });
  }
};
