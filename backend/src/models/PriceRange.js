const mongoose = require('mongoose');

const priceRangeSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    minPrice: { type: Number, default: 0 },
    maxPrice: { type: Number, required: true },
    imageUrl: { type: String, default: '' },

    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PriceRange', priceRangeSchema);
