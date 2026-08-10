const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getActiveAnnouncements,
  getAllAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  reorderAnnouncements,
} = require('../controllers/announcementController');

// Public — storefront announcement bar
router.get('/active', getActiveAnnouncements);

// Admin
router.get('/', protect, adminOnly, getAllAnnouncements);
router.put('/reorder', protect, adminOnly, reorderAnnouncements);
router.post('/', protect, adminOnly, createAnnouncement);
router.put('/:id', protect, adminOnly, updateAnnouncement);
router.delete('/:id', protect, adminOnly, deleteAnnouncement);

module.exports = router;
