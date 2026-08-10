const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { uploadShopVideo } = require('../config/cloudinary');
const {
  getActiveShopVideos,
  getAllShopVideos,
  createShopVideo,
  updateShopVideo,
  deleteShopVideo,
  reorderShopVideos,
} = require('../controllers/shopVideoController');

// Public — storefront "Parent's Choice" carousel
router.get('/active', getActiveShopVideos);

// Admin
router.get('/', protect, adminOnly, getAllShopVideos);
router.post('/', protect, adminOnly, uploadShopVideo.single('video'), createShopVideo);
router.put('/reorder', protect, adminOnly, reorderShopVideos);
router.put('/:id', protect, adminOnly, uploadShopVideo.single('video'), updateShopVideo);
router.delete('/:id', protect, adminOnly, deleteShopVideo);

module.exports = router;
