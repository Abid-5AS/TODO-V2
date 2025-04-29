const express = require("express");
const multer = require("multer");
const { authenticateToken } = require("../../middleware/authMiddleware");
const {
  toggleProvider,
  getProviderStatus,
  suggestSubtasks,
  expandDescription,
  checkLocalConnection,
  getDailyVerse,
  suggestTaskFromImage,
} = require("../controllers/aiController");

const router = express.Router();

// Configure multer for single image upload in memory
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size (e.g., 10MB)
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

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

// Route: POST /api/ai/suggest-task-from-image
router.post(
  "/suggest-task-from-image",
  upload.single("image"),
  suggestTaskFromImage,
);

// Route: GET /api/ai/quran/daily-verse (Changed prefix)
// Note: The frontend expects /api/quran/daily-verse, so we mount this router at /api/ai
// and define the specific path here. Alternatively, create separate quran routes.
router.get("/quran/daily-verse", getDailyVerse);

module.exports = router;
