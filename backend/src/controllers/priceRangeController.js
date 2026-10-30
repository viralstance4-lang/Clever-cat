const PriceRange = require('../models/PriceRange');

// ─── GET /api/price-ranges/active — public, used by storefront homepage ───────
exports.getActivePriceRanges = async (_req, res) => {
  const priceRanges = await PriceRange.find({ isActive: true }).sort({ displayOrder: 1, createdAt: -1 });
  res.json({ success: true, count: priceRanges.length, priceRanges });
};

// ─── GET /api/price-ranges — admin, all price ranges ───────────────────────────
exports.getAllPriceRanges = async (_req, res) => {
  const priceRanges = await PriceRange.find().sort({ displayOrder: 1, createdAt: -1 });
  res.json({ success: true, count: priceRanges.length, priceRanges });
};

// ─── GET /api/price-ranges/:id ──────────────────────────────────────────────────
exports.getPriceRange = async (req, res) => {
  const priceRange = await PriceRange.findById(req.params.id);
  if (!priceRange) return res.status(404).json({ success: false, message: 'Price range not found' });
  res.json({ success: true, priceRange });
};

// ─── POST /api/price-ranges ──────────────────────────────────────────────────────
exports.createPriceRange = async (req, res) => {
  const { label, minPrice, maxPrice, imageUrl, displayOrder, isActive } = req.body;
  if (!label?.trim()) return res.status(400).json({ success: false, message: 'Label is required' });
  if (!(Number(maxPrice) > 0)) return res.status(400).json({ success: false, message: 'Max price must be greater than 0' });
  const min = minPrice !== undefined ? Number(minPrice) : 0;
  if (min < 0) return res.status(400).json({ success: false, message: 'Min price cannot be negative' });
  if (min >= Number(maxPrice)) return res.status(400).json({ success: false, message: 'Min price must be less than max price' });

  const priceRange = await PriceRange.create({
    label: label.trim(),
    minPrice: min,
    maxPrice: Number(maxPrice),
    imageUrl: imageUrl || '',
    displayOrder: displayOrder !== undefined ? Number(displayOrder) : 0,
    isActive: isActive === undefined ? true : (isActive === 'true' || isActive === true),
  });

  res.status(201).json({ success: true, priceRange });
};

// ─── PUT /api/price-ranges/:id ────────────────────────────────────────────────────
exports.updatePriceRange = async (req, res) => {
  const priceRange = await PriceRange.findById(req.params.id);
  if (!priceRange) return res.status(404).json({ success: false, message: 'Price range not found' });

  const { label, minPrice, maxPrice, imageUrl, displayOrder, isActive } = req.body;

  const nextMin = minPrice !== undefined ? Number(minPrice) : priceRange.minPrice;
  const nextMax = maxPrice !== undefined ? Number(maxPrice) : priceRange.maxPrice;
  if (nextMin < 0) return res.status(400).json({ success: false, message: 'Min price cannot be negative' });
  if (nextMin >= nextMax) return res.status(400).json({ success: false, message: 'Min price must be less than max price' });

  if (label !== undefined) priceRange.label = label.trim();
  if (minPrice !== undefined) priceRange.minPrice = nextMin;
  if (maxPrice !== undefined) priceRange.maxPrice = nextMax;
  if (imageUrl !== undefined) priceRange.imageUrl = imageUrl;
  if (displayOrder !== undefined) priceRange.displayOrder = Number(displayOrder);
  if (isActive !== undefined) priceRange.isActive = (isActive === 'true' || isActive === true);

  await priceRange.save();
  res.json({ success: true, priceRange });
};

// ─── DELETE /api/price-ranges/:id ──────────────────────────────────────────────────
exports.deletePriceRange = async (req, res) => {
  const priceRange = await PriceRange.findById(req.params.id);
  if (!priceRange) return res.status(404).json({ success: false, message: 'Price range not found' });

  await priceRange.deleteOne();
  res.json({ success: true, message: 'Price range deleted' });
};

// ─── PUT /api/price-ranges/reorder ──────────────────────────────────────────────────
// body: { order: [{ _id, displayOrder }, ...] }
exports.reorderPriceRanges = async (req, res) => {
  const { order } = req.body;
  if (!Array.isArray(order)) {
    return res.status(400).json({ success: false, message: 'order must be an array of { _id, displayOrder }' });
  }

  await Promise.all(
    order.map(({ _id, displayOrder }) => PriceRange.findByIdAndUpdate(_id, { displayOrder }))
  );

  const priceRanges = await PriceRange.find().sort({ displayOrder: 1, createdAt: -1 });
  res.json({ success: true, priceRanges });
};
