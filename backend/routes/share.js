const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { generateShareLink, revokeShareLink, viewShared } = require('../controllers/shareController');

// Public route - view shared itinerary by token
router.get('/:token', viewShared);

// Protected routes
router.post('/:id/generate', protect, generateShareLink);
router.delete('/:id/revoke', protect, revokeShareLink);

module.exports = router;
