const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  signup,
  signin,
  getMe,
  googleAuth,
  googleCallback,
} = require("../controllers/authController");

const router = express.Router();

// --- Route: POST /api/auth/signup ---
// @desc    Register a new user
// @access  Public
router.post("/signup", signup);

// --- Route: POST /api/auth/signin ---
// @desc    Authenticate user & get token (Login)
// @access  Public
router.post("/signin", signin);

// --- Route: GET /api/auth/me
// @desc    Get current logged-in user info
// @access  Private (Requires token)
router.get("/me", protect, getMe);

// --- Google OAuth ---
// @desc    Initiate Google OAuth flow
// @access  Public
router.get("/google", googleAuth);

// @desc    Handle Google OAuth callback
// @access  Public
router.get("/google/callback", googleCallback);

module.exports = router;
