const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
  },
  tagline: {
    type: String,
  },
  description: {
    type: String,
    required: true,
  },
  categories: {
    type: [String],
    default: [],
  },
  categoryIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  // Children's-books specific fields
  ageGroups: { type: [String], default: [] }, // labels from Concern collection, e.g. "0-2", "4-6"
  format: {
    type: [String],
    enum: ['Board Book', 'Picture Book', 'Story Book', 'Activity Book', 'Puzzle', 'Flash Cards', 'Craft Kit', 'Chart', 'Toy', 'Colouring Book', 'Other'],
    default: [],
  },
  author: String,
  illustrator: String,
  pages: String,
  isbn: String,
  language: { type: String, default: 'English' },
  specifications: String,    // dimensions, binding, recommended-use notes, etc.
  seriesName: String,
  titleName: String,
  noOfTitles: String,
  size: String,
  binding: String,
  extras: String,

  // Product variants (e.g. 10g / 20g / 30 Capsules)
  variants: [
    {
      label: String,
      price: Number,
      comparePrice: Number,
      stock: { type: Number, default: 0 },
    },
  ],

  // Package/multi-pack pricing (e.g. "Pack of 1/2/3/5"). Quantity acts as a
  // stock multiplier — buying 1x "Pack of 3" deducts 3 units from `stock`.
  packageVariants: [
    {
      label: { type: String, required: true },
      quantity: { type: Number, required: true, min: 1 },
      price: { type: Number, required: true, min: 0.01 },
      comparePrice: Number,
      sku: String,
      isDefault: { type: Boolean, default: false },
    },
  ],
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  comparePrice: {
    type: Number,
    min: 0,
  },
  costPrice: Number, // for profit analytics

  // ── Structured discount (optional — admin can use these instead of manually setting price) ──
  discountType: {
    type: String,
    enum: ['none', 'percentage', 'fixed'],
    default: 'none',
  },
  discountValue: { type: Number, default: 0, min: 0 },
  images: [
    {
      url: { type: String, required: true },
      public_id: String,
      alt: String,
    },
  ],
  videoUrl: String, // optional product video (direct .mp4 URL, e.g. uploaded via Media Library)
  benefits: [
    {
      title: String,
      description: String,
      icon: String,
    },
  ],
  contents: [String], // "What's Inside" — e.g. ["120 sticker sheets", "1 activity poster"]
  stock: {
    type: Number,
    default: 50,
    min: 0,
  },
  sold: {
    type: Number,
    default: 0,
  },
  weight: Number, // in grams
  dimensions: String,
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  isBestseller: { type: Boolean, default: false },
  isComingSoon: { type: Boolean, default: false },
  tags: [String],
  seoTitle: String,
  seoDescription: String,
  ratings: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 },
  },
  upsells: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
}, { timestamps: true });

// Auto-generate slug + auto-compute price from structured discount
productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  // If admin set a structured discount and there is a comparePrice (MRP), compute price
  if (this.discountType !== 'none' && this.comparePrice > 0) {
    if (this.discountType === 'percentage') {
      const pct = Math.min(this.discountValue, 99); // cap at 99%
      this.price = Math.round(this.comparePrice * (1 - pct / 100));
    } else if (this.discountType === 'fixed') {
      const fixed = Math.min(this.discountValue, this.comparePrice - 1); // price must be ≥ 1
      this.price = Math.max(1, this.comparePrice - fixed);
    }
  }
  next();
});

// Discount percentage virtual
productSchema.virtual('discountPercent').get(function () {
  if (!this.comparePrice) return 0;
  return Math.round(((this.comparePrice - this.price) / this.comparePrice) * 100);
});

productSchema.set('toJSON', { virtuals: true });

productSchema.index({ isActive: 1, isFeatured: -1, createdAt: -1 });
productSchema.index({ isActive: 1, categories: 1 });
productSchema.index({ isActive: 1, isBestseller: 1 });
productSchema.index({ isActive: 1, ageGroups: 1 });
productSchema.index({ name: 'text', description: 'text', author: 'text' });

module.exports = mongoose.model('Product', productSchema);
