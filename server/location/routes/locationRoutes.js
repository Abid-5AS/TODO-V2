const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const { authenticateToken } = require('../../middleware/authMiddleware');

// All location routes should be authenticated
router.use(authenticateToken);

// GET /api/location/search?q=query
router.get('/search', locationController.searchNominatimLocation);

module.exports = router; 