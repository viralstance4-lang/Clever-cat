const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema(
  {
    name:   { type: String, required: true, trim: true },
    city:   { type: String, default: '', trim: true },
    rating: { type: Number, default: 5, min: 1, max: 5 },
    text:   { type: String, required: true, trim: true },

    // Optional photo — falls back to a colour-coded initials avatar when not set
    image:          { type: String, default: '' },
    imagePublicId:  { type: String, default: null },

    displayOrder: { type: Number, default: 0 },
    isActive:     { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Testimonial', testimonialSchema);
