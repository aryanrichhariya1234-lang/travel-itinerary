const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const { processDocuments } = require('../controllers/uploadController');

router.post(
  '/process',
  protect,
  upload.array('documents', 10), // max 10 files
  processDocuments
);

module.exports = router;
