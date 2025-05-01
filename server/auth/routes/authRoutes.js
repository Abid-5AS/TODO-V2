const express = require("express");
const { authenticateToken } = require("../../middleware/authMiddleware");
const {
  signup,
  signin,
  getMe,
  googleAuth,
  googleCallback,
  connectGoogleCalendar,
  googleCalendarCallback,
} = require("../controllers/authController");
const passport = require("passport");

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
router.get("/me", authenticateToken, getMe);

// --- Google OAuth ---
// @desc    Initiate Google OAuth flow
// @access  Public
router.get("/google", googleAuth);

// @desc    Handle Google OAuth callback
// @access  Public
router.get("/google/callback", googleCallback);

// Google Calendar Connection (Requires user to be logged in first)
router.get("/google/calendar/connect", connectGoogleCalendar);
router.get("/google/calendar/callback", googleCalendarCallback);

module.exports = router;
