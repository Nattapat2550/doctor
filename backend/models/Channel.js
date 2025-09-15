import mongoose from "mongoose";

const channelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    userId: { type: String, required: true }, // แยกผู้สร้าง channel
  },
  { timestamps: true }
);

export default mongoose.model("Channel", channelSchema);
