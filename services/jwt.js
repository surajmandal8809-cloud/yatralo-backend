const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  if (!user) throw new Error("Cannot generate token for null user");

  const payload = typeof user.toObject === "function" ? user.toObject() : user;
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "10m" });
};

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token)
    return res.status(401).json({ status: false, message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ status: false, message: "Invalid Token" });
  }
};

module.exports = { generateToken, verifyToken };