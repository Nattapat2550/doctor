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

// Helper: build persona instruction
function buildPersona({ profile = {} }) {
  const tone =
    profile.age && profile.age < 25
      ? "friendly, slightly informal, approachable tone"
      : "warm, empathetic, and understanding tone";

  return [
    "You are a psychotherapist in the style of Sigmund Freud, speak naturally, and listen carefully.",
    "Reflect the user's feelings, ask open-ended questions to encourage sharing.",
    "Respond in short natural sentences (2–5 sentences if appropriate, but adjust to the situation).",
    "Avoid sensitive or violent topics unless directly relevant.",
    `Use a ${tone}.`,
    "Focus on the user's feelings and context from previous messages."
  ].join(" ");
}

// GET chats by channelId
router.get("/:channelId", authMiddleware, async (req, res) => {
  const { channelId } = req.params;
  const userId = req.userId;
  const profile = req.user || {};

  let chats = await Chat.find({ channelId, userId }).sort({ createdAt: 1 });

  if (chats.length === 0) {
    const defaultGreeting = "Hi, I'm here to listen. Would you like to start by sharing what's on your mind?";
    const greetingChat = new Chat({ channelId, userId, role: "assistant", text: defaultGreeting });
    await greetingChat.save();

    res.json([greetingChat]);

    (async () => {
      try {
        const persona = buildPersona({ profile });
        const result = await model.generateContent({
          contents: [
            {
              role: "user",
              parts: [
                { text: `${persona}\nCreate a short, warm greeting for a new user, flexible length (2–5 sentences if appropriate).` }
              ]
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

// POST new chat
router.post("/:channelId", authMiddleware, async (req, res) => {
  try {
    const { channelId } = req.params;
    const userId = req.userId;
    const { text, imageUrl } = req.body;
    const profile = req.user || {};

    const lastChat = await Chat.findOne({ channelId, userId }).sort({ createdAt: -1 });
    if (lastChat && lastChat.role === "user" && lastChat.text === text) {
      return res.status(400).json({ error: "Duplicate message. Please wait for response." });
    }

    const userChat = new Chat({ channelId, userId, role: "user", text, imageUrl: imageUrl || null });
    await userChat.save();

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

    const userLanguage = detectLanguage(text);
    promptParts.push({
      text: `Summarize the main feelings and key points expressed by the user, add encouragement if needed, and reply in ${userLanguage === "thai" ? "Thai" : "English"}. Adjust length flexibly (2–5 sentences if appropriate).`
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
