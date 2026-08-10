const mongoose = require('mongoose');

const shopVideoSchema = new mongoose.Schema(
  {
    title: { type: String, default: '', trim: true },   // optional caption overlay; falls back to the tagged product's name
    badge: { type: String, default: 'NEW', trim: true }, // small corner label, e.g. "NEW"
    views: { type: Number, default: 0 },                 // display-only counter, e.g. shown as "3.8k"

    videoUrl:      { type: String, required: true },
    videoPublicId: { type: String, required: true },

    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },

    displayOrder: { type: Number, default: 0 },
    isActive:     { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ShopVideo', shopVideoSchema);
