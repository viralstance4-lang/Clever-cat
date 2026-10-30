const express = require('express');
const router = express.Router();
const { protect, adminOnly, optionalAuth } = require('../middleware/auth');
const {
  validateCoupon,
  getAutoApplyCoupon,
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} = require('../controllers/couponController');

// Public — frontend cart uses these. optionalAuth populates req.user when a
// valid token is present (needed for firstOrderOnly coupons) without blocking
// guest checkout.
router.post('/validate', optionalAuth, validateCoupon);
router.post('/auto-apply', optionalAuth, getAutoApplyCoupon);

// Admin CRUD
router.get('/',    protect, adminOnly, getAllCoupons);
router.post('/',   protect, adminOnly, createCoupon);
router.put('/:id', protect, adminOnly, updateCoupon);
router.delete('/:id', protect, adminOnly, deleteCoupon);

module.exports = router;
