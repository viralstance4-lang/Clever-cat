const path = require('path');
const fs = require('fs');
const Testimonial = require('../models/Testimonial');
const { cloudinary } = require('../config/cloudinary');
const { recordMedia, forgetMedia } = require('../utils/mediaLog');

// multer-storage-cloudinary v4: file.path = secure_url, file.filename = public_id
// multer disk storage:          file.path = absolute fs path, file.filename = basename
const fileToImage = (file, req) => {
  const isCloudinary = file.path?.startsWith('http');
  const backendOrigin = `${req.protocol}://${req.get('host')}`;
  return {
    url: isCloudinary ? file.path : `${backendOrigin}/uploads/testimonials/${file.filename}`,
    publicId: isCloudinary ? file.filename : null,
  };
};

const destroyCloudinaryImage = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
  } catch (err) {
    console.error('[Cloudinary] destroy failed:', err.message);
  }
  await forgetMedia(publicId);
};

const deleteDiskImage = (url) => {
  if (!url || url.startsWith('http')) return;
  const filePath = path.join(__dirname, '../../uploads/testimonials', path.basename(url));
  fs.unlink(filePath, () => {});
};

const removeImage = async (url, publicId) => {
  await destroyCloudinaryImage(publicId);
  deleteDiskImage(url);
};

// ─── GET /api/testimonials/active — public, used by the storefront ────────────
exports.getActiveTestimonials = async (_req, res) => {
  const testimonials = await Testimonial.find({ isActive: true }).sort({ displayOrder: 1, createdAt: -1 });
  res.json({ success: true, count: testimonials.length, testimonials });
};

// ─── GET /api/testimonials — admin, all testimonials ───────────────────────────
exports.getAllTestimonials = async (_req, res) => {
  const testimonials = await Testimonial.find().sort({ displayOrder: 1, createdAt: -1 });
  res.json({ success: true, count: testimonials.length, testimonials });
};

// ─── POST /api/testimonials ───────────────────────────────────────────────────────
exports.createTestimonial = async (req, res) => {
  const { name, city, rating, text, displayOrder, isActive } = req.body;
  if (!name?.trim() || !text?.trim()) {
    return res.status(400).json({ success: false, message: 'Name and testimonial text are required' });
  }

  const image = req.file ? fileToImage(req.file, req) : (req.body.image ? { url: req.body.image, publicId: null } : null);
  if (req.file) await recordMedia(req.file, { source: 'testimonial', label: name });

  const testimonial = await Testimonial.create({
    name: name.trim(),
    city: city || '',
    rating: rating !== undefined ? Number(rating) : 5,
    text: text.trim(),
    image: image?.url || '',
    imagePublicId: image?.publicId || null,
    displayOrder: displayOrder !== undefined ? Number(displayOrder) : 0,
    isActive: isActive === undefined ? true : (isActive === 'true' || isActive === true),
  });

  res.status(201).json({ success: true, testimonial });
};

// ─── PUT /api/testimonials/:id ─────────────────────────────────────────────────────
exports.updateTestimonial = async (req, res) => {
  const testimonial = await Testimonial.findById(req.params.id);
  if (!testimonial) return res.status(404).json({ success: false, message: 'Testimonial not found' });

  const { name, city, rating, text, displayOrder, isActive, removeImage: removeImageFlag, image: imageUrl } = req.body;

  if (req.file) {
    await removeImage(testimonial.image, testimonial.imagePublicId);
    await recordMedia(req.file, { source: 'testimonial', label: name ?? testimonial.name });
    const image = fileToImage(req.file, req);
    testimonial.image = image.url;
    testimonial.imagePublicId = image.publicId;
  } else if (removeImageFlag === 'true' && testimonial.image) {
    await removeImage(testimonial.image, testimonial.imagePublicId);
    testimonial.image = '';
    testimonial.imagePublicId = null;
  } else if (imageUrl !== undefined && imageUrl !== testimonial.image) {
    testimonial.image = imageUrl;
    testimonial.imagePublicId = null;
  }

  if (name !== undefined) testimonial.name = name;
  if (city !== undefined) testimonial.city = city;
  if (rating !== undefined) testimonial.rating = Number(rating);
  if (text !== undefined) testimonial.text = text;
  if (displayOrder !== undefined) testimonial.displayOrder = Number(displayOrder);
  if (isActive !== undefined) testimonial.isActive = (isActive === 'true' || isActive === true);

  await testimonial.save();
  res.json({ success: true, testimonial });
};

// ─── DELETE /api/testimonials/:id ──────────────────────────────────────────────────
exports.deleteTestimonial = async (req, res) => {
  const testimonial = await Testimonial.findById(req.params.id);
  if (!testimonial) return res.status(404).json({ success: false, message: 'Testimonial not found' });

  await removeImage(testimonial.image, testimonial.imagePublicId);

  await testimonial.deleteOne();
  res.json({ success: true, message: 'Testimonial deleted' });
};

// ─── PUT /api/testimonials/reorder ──────────────────────────────────────────────────
// body: { order: [{ _id, displayOrder }, ...] }
exports.reorderTestimonials = async (req, res) => {
  const { order } = req.body;
  if (!Array.isArray(order)) {
    return res.status(400).json({ success: false, message: 'order must be an array of { _id, displayOrder }' });
  }

  await Promise.all(
    order.map(({ _id, displayOrder }) => Testimonial.findByIdAndUpdate(_id, { displayOrder }))
  );

  const testimonials = await Testimonial.find().sort({ displayOrder: 1, createdAt: -1 });
  res.json({ success: true, testimonials });
};
