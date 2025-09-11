import express from "express";
import Channel from "../models/Channel.js";
import Chat from "../models/Chat.js";

const router = express.Router();

// GET all channels
router.get("/", async (req, res) => {
  try {
    const channels = await Channel.find({});
    res.json(channels);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch channels" });
  }
});

// CREATE channel
router.post("/", async (req, res) => {
  try {
    const { name } = req.body;
    const channel = new Channel({ name });
    await channel.save();
    res.json(channel);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create channel" });
  }
});

// RENAME channel
router.put("/:id", async (req, res) => {
  try {
    const { name } = req.body;
    const channel = await Channel.findByIdAndUpdate(req.params.id, { name }, { new: true });
    res.json(channel);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to rename channel" });
  }
});

// DELETE channel + its chats
router.delete("/:id", async (req, res) => {
  try {
    await Channel.findByIdAndDelete(req.params.id);
    await Chat.deleteMany({ channelId: req.params.id });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete channel" });
  }
});

export default router;
