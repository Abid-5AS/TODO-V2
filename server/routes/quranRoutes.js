const express = require('express');
const router = express.Router();
const quranController = require('../controllers/quranController');

// GET /api/quran/daily-verse - Fetch the daily Quran verse
router.get('/daily-verse', quranController.getDailyVerse);

module.exports = router; 