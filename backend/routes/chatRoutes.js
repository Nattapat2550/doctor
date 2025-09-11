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
// POST new chat
router.post("/:channelId", authMiddleware, async (req, res) => {
  try {
    const { channelId } = req.params;
    const { userId } = req;
    const { text, imageUrl } = req.body;

    // บันทึกข้อความ user
    const userChat = new Chat({ channelId, userId, role: "user", text, imageUrl: imageUrl || null });
    await userChat.save();

    // สร้าง prompt สำหรับ Gemini API
    let restrictedPrompt = `
You are a psychiatrist in the style of Sigmund Freud. 
Your role is to deeply understand the emotions, thoughts, and feelings of the patient.
Respond as a real psychiatrist would, showing empathy, insight, and careful observation.
Avoid sounding like AI. Speak naturally, as if you are having a conversation with a real patient.
Analyze both the explicit and implicit aspects of what the patient expresses.
Provide guidance, coping strategies, and advice based on psychiatric principles to help the patient in the most practical and beneficial way.
User asked: "${text}"
`;

    // ถ้ามีรูป ให้ต่อ URL ของรูปเข้าไป
    if (imageUrl) {
      restrictedPrompt += `\nThe user also provided an image: ${imageUrl}`;
    }

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
