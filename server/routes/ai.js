const express = require("express");
const { authenticateToken } = require("../middleware/authMiddleware");
const {
  toggleProvider,
  getProviderStatus,
  suggestSubtasks,
  expandDescription,
} = require("../controllers/aiController");

const router = express.Router();

// Apply auth middleware to all routes
router.use(authenticateToken);

// Route: POST /api/ai/toggle-provider
router.post("/toggle-provider", toggleProvider);

// Route: GET /api/ai/provider-status
router.get("/provider-status", getProviderStatus);

// Route: POST /api/ai/suggest-subtasks
router.post("/suggest-subtasks", suggestSubtasks);

// Route: POST /api/ai/expand-description
router.post("/expand-description", expandDescription);

module.exports = router;
