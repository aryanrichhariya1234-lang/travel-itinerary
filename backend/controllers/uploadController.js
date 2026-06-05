const { cloudinary } = require('../config/cloudinary');
const { extractTextFromDocument, generateItinerary } = require('../utils/aiService');
const Itinerary = require('../models/Itinerary');

/**
 * POST /api/upload/process
 * Accepts multiple files, extracts text, generates itinerary
 */
exports.processDocuments = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded.' });
    }

    // Build document metadata array
    const documents = req.files.map((file) => ({
      originalName: file.originalname,
      cloudinaryUrl: file.path,
      cloudinaryPublicId: file.filename,
      fileType: file.mimetype === 'application/pdf' ? 'pdf' : 'image',
    }));

    // Create a placeholder itinerary record (processing state)
    const itinerary = await Itinerary.create({
      user: req.user._id,
      title: 'Generating your itinerary...',
      destination: 'Processing...',
      documents,
      status: 'processing',
    });

    // Respond immediately so the client can poll / show loading
    res.status(202).json({
      message: 'Documents uploaded. Itinerary generation started.',
      itineraryId: itinerary._id,
    });

    // ─── Background Processing ────────────────────────────────────────────────
    (async () => {
      try {
        // 1. Extract text from each document
        const extractionPromises = documents.map((doc) =>
          extractTextFromDocument(doc.cloudinaryUrl, doc.fileType)
        );
        const extractedTexts = await Promise.all(extractionPromises);
        const combinedText = extractedTexts.join('\n\n');

        if (!combinedText.trim()) {
          await Itinerary.findByIdAndUpdate(itinerary._id, {
            status: 'failed',
            title: 'Extraction failed',
          });
          return;
        }

        // 2. Generate structured itinerary via AI
        const generated = await generateItinerary(extractedTexts);

        // 3. Save the full itinerary
        await Itinerary.findByIdAndUpdate(itinerary._id, {
          ...generated,
          documents,
          extractedText: combinedText,
          status: 'ready',
        });
      } catch (err) {
        console.error('Background processing error:', err);
        await Itinerary.findByIdAndUpdate(itinerary._id, {
          status: 'failed',
          title: 'Generation failed',
        });
      }
    })();
  } catch (err) {
    next(err);
  }
};
