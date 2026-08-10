const Announcement = require('../models/Announcement');

// ─── GET /api/announcements/active — public, used by the storefront top bar ───
exports.getActiveAnnouncements = async (_req, res) => {
  const announcements = await Announcement.find({ isActive: true }).sort({ displayOrder: 1, createdAt: -1 });
  res.json({ success: true, count: announcements.length, announcements });
};

// ─── GET /api/announcements — admin, all announcements ────────────────────────
exports.getAllAnnouncements = async (_req, res) => {
  const announcements = await Announcement.find().sort({ displayOrder: 1, createdAt: -1 });
  res.json({ success: true, count: announcements.length, announcements });
};

// ─── POST /api/announcements ────────────────────────────────────────────────────
exports.createAnnouncement = async (req, res) => {
  const { text, link, icon, displayOrder, isActive } = req.body;
  if (!text?.trim()) {
    return res.status(400).json({ success: false, message: 'Announcement text is required' });
  }

  const announcement = await Announcement.create({
    text: text.trim(),
    link: link?.trim() || '',
    icon: icon || 'Sparkles',
    displayOrder: displayOrder !== undefined ? Number(displayOrder) : 0,
    isActive: isActive === undefined ? true : (isActive === 'true' || isActive === true),
  });

  res.status(201).json({ success: true, announcement });
};

// ─── PUT /api/announcements/:id ──────────────────────────────────────────────────
exports.updateAnnouncement = async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);
  if (!announcement) return res.status(404).json({ success: false, message: 'Announcement not found' });

  const { text, link, icon, displayOrder, isActive } = req.body;

  if (text !== undefined) announcement.text = text.trim();
  if (link !== undefined) announcement.link = link.trim();
  if (icon !== undefined) announcement.icon = icon;
  if (displayOrder !== undefined) announcement.displayOrder = Number(displayOrder);
  if (isActive !== undefined) announcement.isActive = (isActive === 'true' || isActive === true);

  await announcement.save();
  res.json({ success: true, announcement });
};

// ─── DELETE /api/announcements/:id ───────────────────────────────────────────────
exports.deleteAnnouncement = async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);
  if (!announcement) return res.status(404).json({ success: false, message: 'Announcement not found' });

  await announcement.deleteOne();
  res.json({ success: true, message: 'Announcement deleted' });
};

// ─── PUT /api/announcements/reorder ──────────────────────────────────────────────
// body: { order: [{ _id, displayOrder }, ...] }
exports.reorderAnnouncements = async (req, res) => {
  const { order } = req.body;
  if (!Array.isArray(order)) {
    return res.status(400).json({ success: false, message: 'order must be an array of { _id, displayOrder }' });
  }

  await Promise.all(
    order.map(({ _id, displayOrder }) => Announcement.findByIdAndUpdate(_id, { displayOrder }))
  );

  const announcements = await Announcement.find().sort({ displayOrder: 1, createdAt: -1 });
  res.json({ success: true, announcements });
};
