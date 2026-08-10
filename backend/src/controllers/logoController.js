const path = require('path');
const fs = require('fs');
const Logo = require('../models/Logo');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

// GET /api/logos
exports.getAllLogos = async (req, res) => {
  const { search, status } = req.query;
  const filter = {};
  if (status && ['active', 'inactive'].includes(status)) filter.status = status;
  if (search) filter.name = { $regex: search, $options: 'i' };

  const logos = await Logo.find(filter).sort({ order: 1, createdAt: -1 });
  res.json({ success: true, count: logos.length, logos });
};

// POST /api/logos
exports.createLogo = async (req, res) => {
  const { name, altText, width, height, status, order, image: imageUrl } = req.body;
  if (!req.file && !imageUrl) {
    return res.status(400).json({ success: false, message: 'Logo image is required' });
  }

  const logo = await Logo.create({
    name,
    imageUrl: req.file ? `${BASE_URL}/uploads/logos/${req.file.filename}` : imageUrl,
    publicId: req.file ? req.file.filename : null,
    altText: altText || name,
    width: width || '120px',
    height: height || 'auto',
    status: status || 'active',
    order: order ? Number(order) : 0,
  });

  res.status(201).json({ success: true, logo });
};

// PUT /api/logos/:id
exports.updateLogo = async (req, res) => {
  const logo = await Logo.findById(req.params.id);
  if (!logo) return res.status(404).json({ success: false, message: 'Logo not found' });

  const { name, altText, width, height, status, order, image: imageUrl } = req.body;

  if (req.file) {
    // Delete old file from disk
    if (logo.publicId) {
      const oldPath = path.join(__dirname, '../../uploads/logos', logo.publicId);
      fs.unlink(oldPath, () => {});
    }
    logo.imageUrl = `${BASE_URL}/uploads/logos/${req.file.filename}`;
    logo.publicId = req.file.filename;
  } else if (imageUrl !== undefined && imageUrl !== logo.imageUrl) {
    // Swapped to a URL picked from the shared Media Library — don't touch the
    // local-disk file since old-style logos still reference one by publicId.
    logo.imageUrl = imageUrl;
    logo.publicId = null;
  }

  if (name !== undefined) logo.name = name;
  if (altText !== undefined) logo.altText = altText;
  if (width !== undefined) logo.width = width;
  if (height !== undefined) logo.height = height;
  if (status !== undefined) logo.status = status;
  if (order !== undefined) logo.order = Number(order);

  await logo.save();
  res.json({ success: true, logo });
};

// DELETE /api/logos/:id
exports.deleteLogo = async (req, res) => {
  const logo = await Logo.findById(req.params.id);
  if (!logo) return res.status(404).json({ success: false, message: 'Logo not found' });

  if (logo.publicId) {
    const filePath = path.join(__dirname, '../../uploads/logos', logo.publicId);
    fs.unlink(filePath, () => {});
  }

  await logo.deleteOne();
  res.json({ success: true, message: 'Logo deleted' });
};
