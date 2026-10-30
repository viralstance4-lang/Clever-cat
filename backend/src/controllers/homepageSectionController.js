const mongoose = require('mongoose');
const HomepageSection = require('../models/HomepageSection');

// Fixed catalogue of sections the storefront homepage knows how to render.
// Seeded once; `label`/`hasHeading` never change after that (only an admin's
// badge/heading/isVisible/displayOrder edits persist).
const DEFAULT_SECTIONS = [
  { key: 'hero',           label: 'Hero Banner',      hasHeading: false, displayOrder: 0 },
  { key: 'trustBadges',    label: 'Trust Badges',     hasHeading: false, displayOrder: 1 },
  { key: 'shopByCategory', label: 'Shop by Category', hasHeading: true,  displayOrder: 2, badge: 'Explore', heading: 'Shop by Category', subtitle: 'Story books, puzzles, craft kits and more — organised the way parents actually shop' },
  { key: 'shopByAge',      label: 'Shop by Age',      hasHeading: true,  displayOrder: 3, badge: 'Personalised Picks', heading: 'Shop by Age', subtitle: "Find the perfect books and learning products for every stage of your child's growth" },
  { key: 'shopByPrice',    label: 'Shop by Price',    hasHeading: true,  displayOrder: 4, badge: 'Budget Friendly', heading: 'Shop by Price', subtitle: 'Find books and learning products that fit your budget, from pocket-friendly picks to premium collections' },
  { key: 'bestSellers',    label: 'Best Sellers',     hasHeading: true,  displayOrder: 5, badge: 'Our Products', heading: 'Best Sellers' },
  { key: 'shopByVideo',    label: 'Shop by Video',    hasHeading: false, displayOrder: 6 },
  { key: 'newArrivals',    label: 'New Arrivals',     hasHeading: true,  displayOrder: 7, badge: 'Just In', heading: 'New Arrivals' },
  { key: 'whyChooseUs',    label: 'Why Choose Us',    hasHeading: true,  displayOrder: 8, badge: 'Why Choose Us', heading: 'Big Ideas for Little Minds' },
  { key: 'testimonials',   label: 'Testimonials',     hasHeading: true,  displayOrder: 9, badge: 'Parent Love', heading: 'Loved by Parents Everywhere' },
  { key: 'newsletter',     label: 'Newsletter',       hasHeading: false, displayOrder: 10 },
];

const ensureSeeded = async () => {
  const count = await HomepageSection.countDocuments();
  if (count > 0) return;
  await HomepageSection.insertMany(DEFAULT_SECTIONS);
};

// ─── GET /api/homepage-sections — public, used by the storefront homepage ─────
exports.getSections = async (_req, res) => {
  await ensureSeeded();
  const sections = await HomepageSection.find()
    .sort({ displayOrder: 1 })
    .populate('productIds', 'name slug price comparePrice images ratings isActive');
  res.json({ success: true, sections });
};

// ─── POST /api/homepage-sections/custom — admin only — create a free-form block ──
exports.createCustomSection = async (req, res) => {
  const { heading, badge, subtitle, imageUrl, buttonText, buttonUrl, productSource, categorySlug, productIds, productLimit } = req.body;
  if (!heading?.trim()) return res.status(400).json({ success: false, message: 'Heading is required' });

  const last = await HomepageSection.findOne().sort({ displayOrder: -1 });
  let section = await HomepageSection.create({
    key: `custom-${new mongoose.Types.ObjectId().toString()}`,
    label: heading.trim(),
    type: 'custom',
    hasHeading: true,
    heading: heading.trim(),
    badge: badge || '',
    subtitle: subtitle || '',
    imageUrl: imageUrl || '',
    buttonText: buttonText || '',
    buttonUrl: buttonUrl || '',
    productSource: productSource || 'none',
    categorySlug: categorySlug || '',
    productIds: Array.isArray(productIds) ? productIds : [],
    productLimit: productLimit ? Number(productLimit) : 8,
    displayOrder: (last?.displayOrder ?? -1) + 1,
  });
  section = await section.populate('productIds', 'name slug price comparePrice images ratings isActive');

  res.status(201).json({ success: true, section });
};

// ─── PUT /api/homepage-sections/:key — admin only ──────────────────────────────
exports.updateSection = async (req, res) => {
  const { label, badge, heading, subtitle, imageUrl, buttonText, buttonUrl, isVisible, productSource, categorySlug, productIds, productLimit } = req.body;
  const fields = {};
  if (label !== undefined) fields.label = label;
  if (badge !== undefined) fields.badge = badge;
  if (heading !== undefined) fields.heading = heading;
  if (subtitle !== undefined) fields.subtitle = subtitle;
  if (imageUrl !== undefined) fields.imageUrl = imageUrl;
  if (buttonText !== undefined) fields.buttonText = buttonText;
  if (buttonUrl !== undefined) fields.buttonUrl = buttonUrl;
  if (isVisible !== undefined) fields.isVisible = Boolean(isVisible);
  if (productSource !== undefined) fields.productSource = productSource;
  if (categorySlug !== undefined) fields.categorySlug = categorySlug;
  if (productIds !== undefined) fields.productIds = Array.isArray(productIds) ? productIds : [];
  if (productLimit !== undefined) fields.productLimit = Number(productLimit);

  const section = await HomepageSection.findOneAndUpdate(
    { key: req.params.key },
    { $set: fields },
    { new: true }
  ).populate('productIds', 'name slug price comparePrice images ratings isActive');
  if (!section) return res.status(404).json({ success: false, message: 'Section not found' });
  res.json({ success: true, section });
};

// ─── DELETE /api/homepage-sections/:key — admin only — custom sections only ────
exports.deleteSection = async (req, res) => {
  const section = await HomepageSection.findOne({ key: req.params.key });
  if (!section) return res.status(404).json({ success: false, message: 'Section not found' });
  if (section.type !== 'custom') {
    return res.status(400).json({ success: false, message: 'Built-in sections can be hidden but not deleted' });
  }
  await section.deleteOne();
  res.json({ success: true, message: 'Section deleted' });
};

// ─── PUT /api/homepage-sections/reorder — admin only ───────────────────────────
// body: { order: [{ key, displayOrder }, ...] }
exports.reorderSections = async (req, res) => {
  const { order } = req.body;
  if (!Array.isArray(order)) {
    return res.status(400).json({ success: false, message: 'order must be an array of { key, displayOrder }' });
  }

  await Promise.all(
    order.map(({ key, displayOrder }) => HomepageSection.findOneAndUpdate({ key }, { displayOrder }))
  );

  const sections = await HomepageSection.find().sort({ displayOrder: 1 });
  res.json({ success: true, sections });
};
