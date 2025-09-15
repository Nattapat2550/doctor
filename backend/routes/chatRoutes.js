import express from "express";
import Chat from "../models/Chat.js";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { authMiddleware } from "../middleware/auth.js";
import fetch from "node-fetch";

dotenv.config();
const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Helper: convert image URL to base64
async function imageUrlToBase64(url) {
  try {
    const res = await fetch(url);
    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer).toString("base64");
  } catch {
    return null;
  }
}

// Helper: detect language (english/thai fallback)
function detectLanguage(text) {
  return /[\u0E00-\u0E7F]/.test(text) ? "thai" : "english";
}

// Helper: build persona instruction (English, natural tone)
function buildPersona({ profile = {} }) {
  const tone =
    profile.age && profile.age < 25
      ? "friendly, slightly informal, approachable tone"
      : "warm, empathetic, and understanding tone";

  return [
    "You are a psychotherapist in the style of Sigmund Freud, but speak naturally as if you are really listening.",
    "Reflect the user's feelings briefly, ask open-ended questions to encourage them to share more.",
    "Reply in 2-5 short sentences, naturally, not overly analytical or formal.",
    "Avoid sensitive or violent topics unless directly relevant.",
    `Use a ${tone}.`,
    "Respond continuously to previous messages, focusing only on listening to the user's feelings."
  ].join(" ");
}

// GET chats by channelId
router.get("/:channelId", authMiddleware, async (req, res) => {
  const { channelId } = req.params;
  const userId = req.userId;
  const profile = req.user || {};

  let chats = await Chat.find({ channelId, userId }).sort({ createdAt: 1 });

  // ไม่มี chat → แสดง greeting default ทันที
  if (chats.length === 0) {
    const defaultGreeting = "Hi, I'm here to listen. Would you like to start by sharing what's on your mind?";
    const greetingChat = new Chat({ channelId, userId, role: "assistant", text: defaultGreeting });
    await greetingChat.save();

    // ส่ง default greeting กลับทันที
    res.json([greetingChat]);

    // เรียก AI generate greeting แบบ async ไม่บล็อก response
    (async () => {
      try {
        const persona = buildPersona({ profile });
        const result = await model.generateContent({
          contents: [
            {
              role: "user",
              parts: [{ text: `${persona}\nCreate a short, warm 1-2 sentence greeting for a new user.` }]
            }
          ]
        });
        const aiText = result.response.text().trim();
        if (aiText) {
          greetingChat.text = aiText;
          await greetingChat.save();
        }
      } catch (err) {
        console.error("AI greeting error:", err);
      }
    })();

    return;
  }

  res.json(chats);
});

// POST new chat with context, summary, encouragement
router.post("/:channelId", authMiddleware, async (req, res) => {
  try {
    const { channelId } = req.params;
    const userId = req.userId;
    const { text, imageUrl } = req.body;
    const profile = req.user || {};

    // --- Prevent duplicate message ---
    const lastChat = await Chat.findOne({ channelId, userId }).sort({ createdAt: -1 });
    if (lastChat && lastChat.role === "user" && lastChat.text === text) {
      return res.status(400).json({ error: "Duplicate message. Please wait for response." });
    }

    // Save user message
    const userChat = new Chat({ channelId, userId, role: "user", text, imageUrl: imageUrl || null });
    await userChat.save();

    // Get last 20 messages for context
    const history = await Chat.find({ channelId, userId }).sort({ createdAt: 1 }).limit(20);
    const promptParts = [];

    for (const msg of history) {
      promptParts.push({
        text: `${msg.role === "user" ? "Patient said" : "Assistant replied"}: "${msg.text}"`
      });
    }

    const persona = buildPersona({ profile });
    promptParts.unshift({ text: persona });

    if (imageUrl) {
      const base64 = await imageUrlToBase64(imageUrl);
      if (base64) promptParts.unshift({ inlineData: { mimeType: "image/jpeg", data: base64 } });
    }

    // Detect user language
    const userLanguage = detectLanguage(text);

    // Add instruction to summarize, encourage, and reply in same language
    promptParts.push({
      text: `Summarize the main feelings and key points expressed by the user in 1-2 sentences, add short encouragement if needed, and reply in ${userLanguage === "thai" ? "Thai" : "English"}. Keep the tone friendly and natural.`
    });

    let assistantText = "";
    let summaryText = "";
    try {
      const result = await model.generateContent({ contents: [{ role: "user", parts: promptParts }] });
      const fullResponse = result.response.text().trim();
      assistantText = fullResponse;
      summaryText = fullResponse;
    } catch {
      assistantText = userLanguage === "thai"
        ? "ขอโทษครับ ตอนนี้ผมไม่สามารถตอบได้ ลองใหม่ภายหลังได้ไหม?"
        : "Sorry, I can’t respond right now. Please try again later.";
      summaryText = "";
    }

    const assistantChat = new Chat({
      channelId,
      userId,
      role: "assistant",
      text: assistantText,
      summary: summaryText
    });
    await assistantChat.save();

    res.json({ userChat, assistantChat });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to post chat" });
  }
});

export default router;
