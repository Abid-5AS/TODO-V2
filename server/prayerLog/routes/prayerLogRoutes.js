const express = require("express");
const router = express.Router();
const prayerLogController = require("../controllers/prayerLogController");
const { authenticateToken } = require("../../middleware/authMiddleware"); // Assuming you have auth middleware

// Apply authentication middleware to all prayer log routes
router.use("/", authenticateToken);

// POST /api/prayer-logs - Log or update a prayer's status
router.post("/", prayerLogController.logOrUpdatePrayer);

// GET /api/prayer-logs/daily - Get logs for a specific date (e.g., /daily?date=YYYY-MM-DD)
router.get("/daily", prayerLogController.getDailyLogs);

// GET /api/prayer-logs/calendar - Get monthly count data (e.g., /calendar?month=YYYY-MM)
router.get("/calendar", prayerLogController.getMonthlyCalendarData);

// GET /api/prayer-logs/stats - Get prayer statistics (streaks, etc.)
router.get("/stats", prayerLogController.getPrayerStats);

module.exports = router;
