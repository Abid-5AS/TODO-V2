const express = require("express");
const { authenticateToken } = require("../../middleware/authMiddleware");
const {
  toggleProvider,
  getProviderStatus,
  suggestSubtasks,
  expandDescription,
  checkLocalConnection,
  getDailyVerse,
} = require("../controllers/aiController");

const router = express.Router();

// Apply auth middleware to all routes
router.use(authenticateToken);

// Route: POST /api/ai/toggle-provider
router.post("/toggle-provider", toggleProvider);

// Route: GET /api/ai/provider-status
router.get("/provider-status", getProviderStatus);

// Route: GET /api/ai/check-local-connection
router.get("/check-local-connection", checkLocalConnection);

// Route: POST /api/ai/suggest-subtasks
router.post("/suggest-subtasks", suggestSubtasks);

// Route: POST /api/ai/expand-description
router.post("/expand-description", expandDescription);

// Route: GET /api/ai/quran/daily-verse (Changed prefix)
// Note: The frontend expects /api/quran/daily-verse, so we mount this router at /api/ai
// and define the specific path here. Alternatively, create separate quran routes.
router.get("/quran/daily-verse", getDailyVerse);

module.exports = router;
