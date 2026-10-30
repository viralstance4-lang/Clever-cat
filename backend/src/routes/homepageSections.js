const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { getSections, updateSection, reorderSections, createCustomSection, deleteSection } = require('../controllers/homepageSectionController');

// Public — storefront homepage layout
router.get('/', getSections);

// Admin
router.put('/reorder', protect, adminOnly, reorderSections);
router.post('/custom', protect, adminOnly, createCustomSection);
router.put('/:key', protect, adminOnly, updateSection);
router.delete('/:key', protect, adminOnly, deleteSection);

module.exports = router;
