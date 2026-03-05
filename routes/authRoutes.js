const express = require("express");
const AuthController = require("../controllers/AuthController");
const { verifyToken, generateToken } = require("../services/jwt");
const passport = require("../config/passport");

const router = express.Router();

// Standard auth routes
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/forgotpassword", AuthController.forgotPassword);
router.post("/resetpassword", verifyToken, AuthController.resetPassword);
router.post("/verify", AuthController.verify);

// Google OAuth
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth/login/failed', session: false }),
  async (req, res) => {
    try {
      // req.user is already the DB user
      const token = generateToken(req.user);

      // Redirect to frontend with JWT
      res.redirect(`${process.env.FRONTEND_URL}/auth/login/success?token=${token}`);
    } catch (err) {
      console.error("Google callback error:", err);
      res.redirect(`${process.env.FRONTEND_URL}/auth/login/failed`);
    }
  }
);

// Optional: route to debug login failures
router.get("/login/failed", (req, res) => {
  res.status(401).json({ status: false, message: "Google login failed" });
});

module.exports = router;