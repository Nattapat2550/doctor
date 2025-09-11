import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  channelId: { type: mongoose.Schema.Types.ObjectId, ref: "Channel", required: true },
  role: { type: String, enum: ["user", "assistant"], required: true },
  text: { type: String },
  imageUrl: { type: String }
}, { timestamps: true });

export default mongoose.model("Chat", chatSchema);
