require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const Announcement = require('../models/Announcement');
const connectDB = require('../config/db');

const ANNOUNCEMENTS = [
  { text: 'Flat 10% off your first order', link: '/shop', icon: 'Percent', displayOrder: 0 },
  { text: 'Free Shipping above ₹499', link: '/policy/shipping', icon: 'Truck', displayOrder: 1 },
  { text: 'Loved by Parents Everywhere', link: '/about', icon: 'Star', displayOrder: 2 },
];

async function seedAnnouncements() {
  await connectDB();

  for (const a of ANNOUNCEMENTS) {
    const existing = await Announcement.findOne({ text: a.text });
    if (existing) {
      existing.link = a.link;
      existing.icon = a.icon;
      existing.displayOrder = a.displayOrder;
      existing.isActive = true;
      await existing.save();
    } else {
      await Announcement.create({ ...a, isActive: true });
    }
    console.log(`✅ Upserted announcement: ${a.text}`);
  }

  console.log('\n🎉 Announcements seeded successfully!');
}

module.exports = seedAnnouncements;

if (require.main === module) {
  seedAnnouncements()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seed announcements error:', err);
      process.exit(1);
    });
}
