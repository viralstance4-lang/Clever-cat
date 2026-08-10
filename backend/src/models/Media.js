const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema(
  {
    url:      { type: String, required: true },
    publicId: { type: String, required: true },
    type:     { type: String, enum: ['image', 'video', 'pdf'], required: true },
    filename: { type: String, default: '' },   // original file name
    format:   { type: String, default: '' },   // jpg, png, mp4 …
    size:     { type: Number, default: 0 },    // bytes
    // Where this upload came from — lets the Media Library show every asset
    // uploaded anywhere in the admin, not just direct Media Library uploads.
    source:   { type: String, enum: ['library', 'product', 'banner', 'concern', 'shopVideo', 'testimonial'], default: 'library' },
    label:    { type: String, default: '' },   // e.g. product name / banner title, for context in the library
  },
  { timestamps: true }
);

module.exports = mongoose.model('Media', mediaSchema);
