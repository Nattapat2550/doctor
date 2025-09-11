import express from "express";
import Chat from "../models/Chat.js";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();
const router = express.Router();

// สร้าง instance ของ Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" }); // ใช้ pro แทน flash

// GET chats by channel
router.get("/:channelId", async (req, res) => {
  try {
    const chats = await Chat.find({ channelId: req.params.channelId });
    res.json(chats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch chats" });
  }
});

// POST new chat message
router.post("/:channelId", async (req, res) => {
  try {
    const { text, imageUrl } = req.body;
    const channelId = req.params.channelId;

    // บันทึกข้อความผู้ใช้
    const userChat = new Chat({ channelId, role: "user", text, imageUrl });
    await userChat.save();

    // Prompt ที่กำหนดให้ AI
    const restrictedPrompt = `
You are a supportive and knowledgeable guidance counselor. 
Your role is to help users with any kind of question, including general life concerns and sensitive or personal issues. 
Always respond with empathy, encouragement, and practical advice, as if you are a caring counselor who wants to see the user grow. 
When giving suggestions, draw inspiration and insights from well-known psychologists, educators, and mentors, while keeping your tone warm, understanding, and approachable.

If the user brings up highly sensitive topics such as self-harm, suicidal thoughts, abuse, or trauma:
- Respond calmly with compassion, never judgment. 
- Gently encourage them to reach out to a trusted friend, family member, or a licensed professional. 
- Provide resources (like hotlines or professional services) if possible.
- Always prioritize safety, dignity, and hope in your response.

Emergency resources:
- Thailand: Mental Health Hotline 1323 (24/7 free support)
- International: If in immediate danger, please call your local emergency number (e.g., 911 in the US).
- Global suicide prevention hotlines: https://findahelpline.com, or search for local crisis hotline in your country.

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

    // บันทึกข้อความตอบกลับจาก AI
    const assistantChat = new Chat({ channelId, role: "assistant", text: assistantText });
    await assistantChat.save();

    res.json({ userChat, assistantChat });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to post chat" });
  }
});

export default router;
