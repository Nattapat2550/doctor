import express from "express";
import Chat from "../models/Chat.js";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { authMiddleware } from "../middleware/auth.js";

dotenv.config();
const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

// GET chats by channelId แยก userId
router.get("/:channelId", authMiddleware, async (req, res) => {
  try {
    const { channelId } = req.params;
    const { userId } = req;

    const chats = await Chat.find({ channelId, userId }).sort({ createdAt: 1 });
    res.json(chats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch chats" });
  }
});

// POST new chat
router.post("/:channelId", authMiddleware, async (req, res) => {
  try {
    const { channelId } = req.params;
    const { userId } = req;
    const { text, imageUrl } = req.body;

    // บันทึกข้อความ user
    const userChat = new Chat({ channelId, userId, role: "user", text, imageUrl });
    await userChat.save();

    const restrictedPrompt = `
You are a supportive guidance counselor.
Respond empathetically and practically to the user's question.
User asked: "${text}"
`;

    let assistantText = "";
    try {
      const result = await model.generateContent(restrictedPrompt);
      assistantText = result.response.text();
    } catch (err) {
      console.error("Gemini API error:", err);
      assistantText = "Error calling Gemini API.";
    }

    const assistantChat = new Chat({ channelId, userId, role: "assistant", text: assistantText });
    await assistantChat.save();

    res.json({ userChat, assistantChat });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to post chat" });
  }
});

export default router;
