import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import channelRoutes from "./routes/channelRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

dotenv.config();

const app = express();

// อนุญาตให้ frontend เข้ามาได้
app.use(cors({ origin: "http://localhost:3221", credentials: true }));
app.use(express.json({ limit: "20mb" }));
app.use(cookieParser());

// เชื่อม MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

// Routes
app.use("/api/channels", channelRoutes);
app.use("/api/chats", chatRoutes);

// Start server
const PORT = process.env.PORT || 3222;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});
