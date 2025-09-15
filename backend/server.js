import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import channelRoutes from "./routes/channelRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

dotenv.config();
const app = express();

app.use(cors({ origin: "http://localhost:3221", credentials: true }));
app.use(express.json({ limit: "20mb" }));

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000 // 10 วินาที
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB error:", err));

app.use("/api/channels", channelRoutes); // ใช้เหมือนเดิม
app.use("/api/chats", chatRoutes);       // chatRoutes แยก userId

const PORT = process.env.PORT || 3222;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});
