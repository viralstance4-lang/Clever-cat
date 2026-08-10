const mongoose = require('mongoose');

const ICONS = ['Leaf', 'Truck', 'Star', 'Gift', 'Percent', 'Sparkles', 'Heart', 'Tag', 'ShieldCheck', 'Clock', 'Phone', 'BadgePercent'];

const announcementSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
    link: { type: String, default: '', trim: true }, // optional — makes the item clickable
    icon: { type: String, enum: ICONS, default: 'Sparkles' },

    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

announcementSchema.statics.ICONS = ICONS;

module.exports = mongoose.model('Announcement', announcementSchema);
