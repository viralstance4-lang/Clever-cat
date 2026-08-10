const Media = require('../models/Media');
const { cloudinary } = require('../config/cloudinary');
const Product = require('../models/Product');
const Banner = require('../models/Banner');
const Concern = require('../models/Concern');

// ─── POST /api/media/upload ────────────────────────────────────────────────────
// Supports uploading multiple files at once (images + videos)
exports.uploadMedia = async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: 'No files uploaded' });
  }

  const docs = req.files.map(file => ({
    url:      file.path,                                          // Cloudinary CDN URL
    publicId: file.filename,                                      // Cloudinary public_id
    type:     file.mimetype === 'application/pdf' ? 'pdf' : (file.mimetype.startsWith('video/') ? 'video' : 'image'),
    filename: file.originalname,
    format:   file.mimetype.split('/')[1] || '',
    size:     file.size || 0,
  }));

  const media = await Media.insertMany(docs);
  res.status(201).json({ success: true, count: media.length, media });
};

// ─── GET /api/media ────────────────────────────────────────────────────────────
// Optional query params: type=image|video  search=  page=  limit=
exports.getAllMedia = async (req, res) => {
  const { type, source, search, page = 1, limit = 60 } = req.query;

  const query = {};
  if (type && ['image', 'video', 'pdf'].includes(type)) query.type = type;
  if (source && ['library', 'product', 'banner', 'concern', 'shopVideo'].includes(source)) query.source = source;
  if (search) query.filename = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };

  const skip = (Number(page) - 1) * Number(limit);
  const [media, total] = await Promise.all([
    Media.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Media.countDocuments(query),
  ]);

  // Aggregate size stats
  const [stats] = await Media.aggregate([
    { $group: { _id: null, totalSize: { $sum: '$size' }, images: { $sum: { $cond: [{ $eq: ['$type', 'image'] }, 1, 0] } }, videos: { $sum: { $cond: [{ $eq: ['$type', 'video'] }, 1, 0] } }, pdfs: { $sum: { $cond: [{ $eq: ['$type', 'pdf'] }, 1, 0] } } } },
  ]);

  res.json({
    success: true,
    media,
    total,
    pages: Math.ceil(total / Number(limit)),
    stats: stats || { totalSize: 0, images: 0, videos: 0, pdfs: 0 },
  });
};

// ─── DELETE /api/media/:id ─────────────────────────────────────────────────────
// Removes the file from Cloudinary AND the database
exports.deleteMedia = async (req, res) => {
  const media = await Media.findById(req.params.id);
  if (!media) return res.status(404).json({ success: false, message: 'Media not found' });

  // Destroy from Cloudinary (resource_type must match what was uploaded)
  try {
    await cloudinary.uploader.destroy(media.publicId, {
      resource_type: media.type === 'video' ? 'video' : media.type === 'pdf' ? 'raw' : 'image',
    });
  } catch (cloudErr) {
    // Log but don't block — still remove the DB record
    console.error('[Cloudinary] destroy failed:', cloudErr.message);
  }

  await media.deleteOne();
  res.json({ success: true, message: 'Media deleted' });
};

// ─── POST /api/media/backfill ───────────────────────────────────────────────────
// Imports Cloudinary images already attached to Products, Banners and Concerns —
// uploaded before Media Library tracking existed — so they show up here too and
// can be cleaned up from one place. Safe to re-run: skips anything already tracked.
exports.backfillMedia = async (req, res) => {
  const existingIds = new Set((await Media.find({}, 'publicId')).map(m => m.publicId));
  const candidates = [];

  const products = await Product.find({ 'images.public_id': { $ne: null } }, 'name images');
  for (const p of products) {
    for (const img of p.images) {
      if (img.public_id && !existingIds.has(img.public_id)) {
        candidates.push({ publicId: img.public_id, source: 'product', label: p.name });
      }
    }
  }

  const banners = await Banner.find({
    $or: [{ desktopImagePublicId: { $ne: null } }, { mobileImagePublicId: { $ne: null } }],
  }, 'title desktopImagePublicId mobileImagePublicId');
  for (const b of banners) {
    if (b.desktopImagePublicId && !existingIds.has(b.desktopImagePublicId)) {
      candidates.push({ publicId: b.desktopImagePublicId, source: 'banner', label: b.title });
    }
    if (b.mobileImagePublicId && !existingIds.has(b.mobileImagePublicId)) {
      candidates.push({ publicId: b.mobileImagePublicId, source: 'banner', label: b.title });
    }
  }

  const concerns = await Concern.find({ imagePublicId: { $ne: null } }, 'label imagePublicId');
  for (const c of concerns) {
    if (c.imagePublicId && !existingIds.has(c.imagePublicId)) {
      candidates.push({ publicId: c.imagePublicId, source: 'concern', label: c.label });
    }
  }

  const seen = new Set();
  const unique = candidates.filter(c => (seen.has(c.publicId) ? false : (seen.add(c.publicId), true)));

  if (unique.length === 0) {
    return res.json({ success: true, imported: 0, skipped: 0 });
  }

  // Fetch real size/format from Cloudinary in batches (Admin API id-lookup limit is 100)
  const metaById = new Map();
  for (let i = 0; i < unique.length; i += 100) {
    const batch = unique.slice(i, i + 100);
    try {
      const { resources } = await cloudinary.api.resources_by_ids(batch.map(c => c.publicId), { resource_type: 'image' });
      for (const r of resources) metaById.set(r.public_id, r);
    } catch (err) {
      console.error('[Media] backfill metadata fetch failed:', err.message);
    }
  }

  const docs = unique
    .filter(c => metaById.has(c.publicId)) // skip ones Cloudinary no longer has
    .map(c => {
      const meta = metaById.get(c.publicId);
      return {
        url:      meta.secure_url,
        publicId: c.publicId,
        type:     'image',
        filename: c.publicId.split('/').pop(),
        format:   meta.format || '',
        size:     meta.bytes || 0,
        source:   c.source,
        label:    c.label || '',
      };
    });

  if (docs.length > 0) await Media.insertMany(docs);

  res.json({ success: true, imported: docs.length, skipped: unique.length - docs.length });
};
