import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  channelId: { type: mongoose.Schema.Types.ObjectId, ref: "Channel", required: true },
  userId: { type: String, required: true }, // ระบุ user
  role: { type: String, enum: ["user", "assistant"], required: true },
  text: { type: String, default: "" },       // สามารถเป็นข้อความว่างได้
  summary: String,
  imageUrl: { type: String, default: "" }    // สามารถเป็นรูปว่างได้
}, { timestamps: true });

export default mongoose.model("Chat", chatSchema);
