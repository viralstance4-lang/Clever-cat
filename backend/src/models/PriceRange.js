const mongoose = require('mongoose');

const priceRangeSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    maxPrice: { type: Number, required: true },

    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PriceRange', priceRangeSchema);
