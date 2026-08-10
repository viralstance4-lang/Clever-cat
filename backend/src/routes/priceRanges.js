const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getActivePriceRanges,
  getAllPriceRanges,
  getPriceRange,
  createPriceRange,
  updatePriceRange,
  deletePriceRange,
  reorderPriceRanges,
} = require('../controllers/priceRangeController');

// Public — storefront homepage
router.get('/active', getActivePriceRanges);

// Admin
router.get('/', protect, adminOnly, getAllPriceRanges);
router.put('/reorder', protect, adminOnly, reorderPriceRanges);
router.post('/', protect, adminOnly, createPriceRange);
router.get('/:id', protect, adminOnly, getPriceRange);
router.put('/:id', protect, adminOnly, updatePriceRange);
router.delete('/:id', protect, adminOnly, deletePriceRange);

module.exports = router;
