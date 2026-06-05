const Itinerary = require('../models/Itinerary');

/**
 * POST /api/share/:id/generate
 * Generate a public share token for an itinerary
 */
exports.generateShareLink = async (req, res, next) => {
  try {
    const itinerary = await Itinerary.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!itinerary) {
      return res.status(404).json({ error: 'Itinerary not found.' });
    }

    if (!itinerary.shareToken) {
      itinerary.generateShareToken();
      await itinerary.save();
    }

    const shareUrl = `${process.env.FRONTEND_URL}/shared/${itinerary.shareToken}`;

    res.json({
      shareToken: itinerary.shareToken,
      shareUrl,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/share/:id/revoke
 * Revoke a share link
 */
exports.revokeShareLink = async (req, res, next) => {
  try {
    const itinerary = await Itinerary.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { shareToken: undefined, isPublic: false },
      { new: true }
    );

    if (!itinerary) {
      return res.status(404).json({ error: 'Itinerary not found.' });
    }

    res.json({ message: 'Share link revoked.' });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/share/:token
 * View a publicly shared itinerary (no auth required)
 */
exports.viewShared = async (req, res, next) => {
  try {
    const itinerary = await Itinerary.findOne({
      shareToken: req.params.token,
      isPublic: true,
    })
      .select('-extractedText')
      .populate('user', 'name avatar');

    if (!itinerary) {
      return res.status(404).json({ error: 'Shared itinerary not found or link has been revoked.' });
    }

    // Increment view count
    await Itinerary.findByIdAndUpdate(itinerary._id, {
      $inc: { shareViewCount: 1 },
    });

    res.json({ itinerary });
  } catch (err) {
    next(err);
  }
};
