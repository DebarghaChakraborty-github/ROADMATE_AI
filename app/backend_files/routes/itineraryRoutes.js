const express = require('express');
const { generateAIItinerary } = require('../controllers/itineraryController');
const router = express.Router();

router.post('/generate', generateAIItinerary);

module.exports = router;
