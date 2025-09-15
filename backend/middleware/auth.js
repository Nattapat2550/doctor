// middleware/auth.js
export const authMiddleware = (req, res, next) => {
  const userId = req.query.token; // ดึงจาก ?token=...
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized. No token provided." });
  }
  req.userId = userId; // assign ให้ route ใช้
  next();
};
