import express from "express";
import Channel from "../models/Channel.js";
import Chat from "../models/Chat.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// GET all channels ของผู้ใช้
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { userId } = req;
    const channels = await Channel.find({ userId });
    res.json(channels);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch channels" });
  }
});

// CREATE channel สำหรับผู้ใช้
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { userId } = req;
    const { name } = req.body;
    const channel = new Channel({ name, userId });
    await channel.save();
    res.json(channel);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create channel" });
  }
});

// RENAME channel ของผู้ใช้
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { userId } = req;
    const { name } = req.body;
    const channel = await Channel.findOneAndUpdate(
      { _id: req.params.id, userId },
      { name },
      { new: true }
    );
    if (!channel) return res.status(404).json({ error: "Channel not found" });
    res.json(channel);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to rename channel" });
  }
});

// DELETE channel + chats ของผู้ใช้
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { userId } = req;

    const channel = await Channel.findOneAndDelete({ _id: req.params.id, userId });
    if (!channel) return res.status(404).json({ error: "Channel not found" });

    await Chat.deleteMany({ channelId: req.params.id, userId }); // ลบ chat ของผู้ใช้เท่านั้น
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete channel" });
  }
});

export default router;
