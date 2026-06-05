const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getMyItineraries,
  getItinerary,
  getStatus,
  deleteItinerary,
  updateItinerary,
} = require('../controllers/itineraryController');

router.use(protect); // All itinerary routes require auth

router.get('/', getMyItineraries);
router.get('/:id', getItinerary);
router.get('/:id/status', getStatus);
router.patch('/:id', updateItinerary);
router.delete('/:id', deleteItinerary);

module.exports = router;
