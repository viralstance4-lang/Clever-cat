const mongoose = require('mongoose');

// One document per homepage section. The set of valid `key`s is fixed (matches
// the sections hardcoded in the storefront HomePage.jsx) — admins can reorder,
// show/hide, and (for sections that support it) override the badge/heading
// text, but can't add arbitrary new section types from here.
const homepageSectionSchema = new mongoose.Schema(
  {
    key:   { type: String, required: true, unique: true },
    label: { type: String, required: true }, // admin-facing name shown in the builder list

    // 'fixed' = one of the built-in storefront sections (Best Sellers, Shop by
    // Age, ...) — content logic lives in code, can be hidden but not deleted.
    // 'custom' = a free-form block the admin created here — fully admin-owned
    // content (heading/subtitle/image/button), can be deleted.
    type: { type: String, enum: ['fixed', 'custom'], default: 'fixed' },

    // Whether this section supports a badge/heading override at all — some
    // fixed sections (hero, trust badges, shop by price, shop by video,
    // newsletter) either have no heading or are already configurable from
    // their own dedicated admin page. Always true for custom sections.
    hasHeading: { type: Boolean, default: false },
    badge:      { type: String, default: '' }, // empty = fall back to the hardcoded default (fixed sections only)
    heading:    { type: String, default: '' }, // empty = fall back to the hardcoded default (fixed sections only)
    subtitle:   { type: String, default: '' }, // description line under the heading — fixed sections fall back to their hardcoded default when empty; custom sections use this as their only subtitle source

    // Custom-section-only content
    imageUrl:   { type: String, default: '' },
    buttonText: { type: String, default: '' },
    buttonUrl:  { type: String, default: '' },

    // Custom-section-only product grid — admin can show a product grid below
    // the heading, sourced from: nothing, every active product, one category,
    // or a hand-picked list of specific products.
    productSource: { type: String, enum: ['none', 'all', 'category', 'manual'], default: 'none' },
    categorySlug:  { type: String, default: '' }, // used when productSource === 'category'
    productIds:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }], // used when productSource === 'manual'
    productLimit:  { type: Number, default: 8 }, // used when productSource === 'all' | 'category'

    isVisible:    { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('HomepageSection', homepageSectionSchema);
