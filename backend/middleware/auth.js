export const authMiddleware = (req, res, next) => {
  const user = req.cookies.user;
  if (!user) {
    return res.status(401).json({ error: "Unauthorized. No user cookie found." });
  }
  req.user = user;
  next();
};
