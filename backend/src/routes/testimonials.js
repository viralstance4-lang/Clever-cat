const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { uploadTestimonial } = require('../config/cloudinary');
const {
  getActiveTestimonials,
  getAllTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  reorderTestimonials,
} = require('../controllers/testimonialController');

// Public — storefront "Loved by Parents Everywhere" carousel
router.get('/active', getActiveTestimonials);

// Admin
router.get('/', protect, adminOnly, getAllTestimonials);
router.post('/', protect, adminOnly, uploadTestimonial.single('image'), createTestimonial);
router.put('/reorder', protect, adminOnly, reorderTestimonials);
router.put('/:id', protect, adminOnly, uploadTestimonial.single('image'), updateTestimonial);
router.delete('/:id', protect, adminOnly, deleteTestimonial);

module.exports = router;
