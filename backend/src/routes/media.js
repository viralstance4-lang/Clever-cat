const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { uploadMedia } = require('../config/cloudinary');
const { uploadMedia: uploadHandler, getAllMedia, deleteMedia, backfillMedia } = require('../controllers/mediaController');

// Public read — admin UI fetches this (protected via admin login, but also okay for GET)
router.get('/', protect, adminOnly, getAllMedia);

// Upload: up to 20 files per request
router.post('/upload', protect, adminOnly, uploadMedia.array('files', 20), uploadHandler);

// Import Cloudinary images already used by Products/Banners/Concerns, uploaded before tracking existed
router.post('/backfill', protect, adminOnly, backfillMedia);

// Delete single item
router.delete('/:id', protect, adminOnly, deleteMedia);

module.exports = router;
