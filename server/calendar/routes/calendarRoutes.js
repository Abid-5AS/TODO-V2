const express = require("express");
const { authenticateToken } = require("../../middleware/authMiddleware"); // Your JWT middleware
const { exchangeCalendarCode } = require("../controllers/calendarController");

const router = express.Router();

// Route to exchange the code received from frontend after Google redirect
// This route MUST be protected to associate the code with the logged-in user
router.post("/exchange-code", authenticateToken, exchangeCalendarCode);

// TODO: Add route for creating events (e.g., POST /events)

module.exports = router; 