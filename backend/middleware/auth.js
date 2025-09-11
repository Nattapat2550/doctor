export const authMiddleware = (req, res, next) => {
  let userId = req.cookies.userId;

  if (!userId) {
    userId = Date.now() + "-" + Math.floor(Math.random() * 10000);
    res.cookie("userId", userId, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
  }

  req.userId = userId;
  next();
};
