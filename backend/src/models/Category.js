const mongoose = require('mongoose');
const slugify = require('../utils/slugify');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    unique: true,
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
  },
  description: String,
  // Slug of the parent category — null/absent for a top-level category.
  // e.g. "story-books" has parentSlug "books"; "puzzles" has no parent.
  parentSlug: { type: String, default: null },
  emoji: { type: String, default: '✨' },
  color: { type: String, default: '#EC1380' },
  imageUrl: String,
  // Optional custom redirect — when set, category cards/links go here instead
  // of the default /shop?category=slug (e.g. to point at a standalone page).
  link: { type: String, default: '', trim: true },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'published',
  },
  order: { type: Number, default: 0 },
}, { timestamps: true });

// Always regenerate slug when name changes (or on first save if slug missing)
categorySchema.pre('save', function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = slugify(this.name);
  }
  next();
});

module.exports = mongoose.model('Category', categorySchema);
