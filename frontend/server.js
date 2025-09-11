import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Serve static files
app.use(cors({ origin: "http://localhost:3222", credentials: true }));
app.use(express.static(__dirname));

const PORT = 3221;
const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`🎨 Frontend running at http://${HOST}:${PORT}`);
});
