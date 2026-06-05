const Itinerary = require('../models/Itinerary');

/**
 * GET /api/itineraries
 * Get all itineraries for the logged-in user
 */
exports.getMyItineraries = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [itineraries, total] = await Promise.all([
      Itinerary.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-extractedText'),
      Itinerary.countDocuments({ user: req.user._id }),
    ]);

    res.json({
      itineraries,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/itineraries/:id
 * Get a single itinerary (must belong to user, or be public)
 */
exports.getItinerary = async (req, res, next) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id).select('-extractedText');

    if (!itinerary) {
      return res.status(404).json({ error: 'Itinerary not found.' });
    }

    // Authorization: owner or public
    if (itinerary.user.toString() !== req.user._id.toString() && !itinerary.isPublic) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    res.json({ itinerary });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/itineraries/:id/status
 * Poll status of a processing itinerary
 */
exports.getStatus = async (req, res, next) => {
  try {
    const itinerary = await Itinerary.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).select('status title destination');

    if (!itinerary) {
      return res.status(404).json({ error: 'Itinerary not found.' });
    }

    res.json({ status: itinerary.status, title: itinerary.title, destination: itinerary.destination });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/itineraries/:id
 */
exports.deleteItinerary = async (req, res, next) => {
  try {
    const itinerary = await Itinerary.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!itinerary) {
      return res.status(404).json({ error: 'Itinerary not found or not authorized.' });
    }

    res.json({ message: 'Itinerary deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/itineraries/:id
 * Update title or tags
 */
exports.updateItinerary = async (req, res, next) => {
  try {
    const allowed = ['title', 'tags'];
    const updates = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });

    const itinerary = await Itinerary.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updates,
      { new: true, runValidators: true }
    ).select('-extractedText');

    if (!itinerary) {
      return res.status(404).json({ error: 'Itinerary not found.' });
    }

    res.json({ itinerary });
  } catch (err) {
    next(err);
  }
};
