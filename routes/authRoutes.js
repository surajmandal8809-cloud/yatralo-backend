const express = require("express");
const AdminAuthController = require("../controllers/AdminAuthController");
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



router.post("/admin/login", AdminAuthController.login);
router.post("/admin/forgotpassword", AdminAuthController.forgotPassword);
router.post("/admin/resetpassword", verifyToken, AdminAuthController.resetPassword);
router.post("/admin/verify", AdminAuthController.verify);




// Google OAuth
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth/login-failed', session: false }),
  async (req, res) => {
    try {
      console.log("Google login successful for:", req.user.email);
      // req.user is already the DB user
      const token = generateToken(req.user);

      // Redirect to frontend with JWT
      const redirectUrl = `${process.env.FRONTEND_URL}/auth/login-success?token=${token}`;
      console.log("Redirecting to:", redirectUrl);
      res.redirect(redirectUrl);
    } catch (err) {
      console.error("Google callback error:", err);
      res.redirect(`${process.env.FRONTEND_URL}/auth/login-failed`);
    }
  }
);

// Optional: route to debug login failures
router.get("/login/failed", (req, res) => {
  res.status(401).json({ status: false, message: "Google login failed" });
});

module.exports = router;