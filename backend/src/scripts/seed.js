require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Product = require('../models/Product');
const User = require('../models/User');
const Category = require('../models/Category');
const Concern = require('../models/Concern');
const connectDB = require('../config/db');

const AGE_GROUPS = [
  { label: '0-2',  icon: '🍼', colorTheme: 'pink',   link: '/shop?ageGroup=0-2' },
  { label: '2-4',  icon: '🧸', colorTheme: 'orange', link: '/shop?ageGroup=2-4' },
  { label: '4-6',  icon: '🎨', colorTheme: 'teal',   link: '/shop?ageGroup=4-6' },
  { label: '6-8',  icon: '📚', colorTheme: 'purple', link: '/shop?ageGroup=6-8' },
  { label: '8-12', icon: '🧩', colorTheme: 'gold',   link: '/shop?ageGroup=8-12' },
  { label: '12+',  icon: '🚀', colorTheme: 'blue',   link: '/shop?ageGroup=12' },
];

// "Books" is a parent category with sub-categories (mega-menu dropdown per the
// Clever Cat scope doc §3.2). The other top-level categories have no children.
const CATEGORIES = [
  { name: 'Books', emoji: '📚', slug: 'books' },
  { name: 'Story Books',     emoji: '📖', slug: 'story-books',    parentSlug: 'books' },
  { name: 'Activity Books',  emoji: '✏️', slug: 'activity-books', parentSlug: 'books' },
  { name: 'Board Books',     emoji: '📗', slug: 'board-books',    parentSlug: 'books' },
  { name: 'Picture Books',   emoji: '🖼️', slug: 'picture-books',  parentSlug: 'books' },
  { name: 'Knowledge Books', emoji: '🔬', slug: 'knowledge-books', parentSlug: 'books' },
  { name: 'Colouring Books', emoji: '🖍️', slug: 'colouring-books', parentSlug: 'books' },
  { name: 'Puzzles',    emoji: '🧩', slug: 'puzzles' },
  { name: 'Games',      emoji: '🎲', slug: 'games' },
  { name: 'Craft Kits', emoji: '🎨', slug: 'craft-kits' },
  { name: 'Flash Cards', emoji: '🃏', slug: 'flash-cards' },
  { name: 'Charts',     emoji: '🗺️', slug: 'charts' },
  { name: 'Toys',       emoji: '🧸', slug: 'toys' },
];

const products = [
  {
    name: 'My First Animals — Illustrated Board Book',
    tagline: 'A colourful first look at the animal kingdom for tiny hands and curious minds',
    description: `A sturdy, chunky board book packed with bright illustrations of familiar animals — from farmyard favourites to jungle giants. Rounded corners and thick pages make it perfect for little hands, while simple one-word labels help build first vocabulary.`,
    categories: ['board-books'],
    ageGroups: ['0-2'],
    format: ['Board Book'],
    author: 'Meera Kapoor',
    illustrator: 'Priya Nair',
    pages: 16,
    isbn: '978-93-00000-01-1',
    language: 'English',
    price: 199,
    comparePrice: 249,
    images: [
      { url: 'https://images.unsplash.com/photo-1512253022256-7999e0e73a37?w=800', alt: 'My First Animals Board Book' },
    ],
    benefits: [
      { title: 'Chunky Board Pages', description: 'Thick, tear-resistant pages built to survive toddler handling.', icon: '📗' },
      { title: 'Builds First Words', description: 'Simple one-word labels next to every picture for early vocabulary.', icon: '🗣️' },
      { title: 'Bright, Bold Illustrations', description: 'High-contrast colours designed to hold a baby\'s attention.', icon: '🎨' },
    ],
    contents: ['16 board pages', '20+ animal illustrations', 'Rounded safety corners'],
    specifications: 'Size: 15cm x 15cm · Binding: Board book · Recommended for ages 0-2',
    stock: 60,
    isFeatured: true,
    isBestseller: true,
    tags: ['board book', 'animals', 'toddler', 'first words'],
    seoTitle: 'My First Animals — Illustrated Board Book for Toddlers | Clever Cat',
    seoDescription: 'A colourful board book of animals for ages 0-2. Chunky pages, bright illustrations, builds first vocabulary.',
  },
  {
    name: '101 Bedtime Stories — Illustrated Story Book',
    tagline: 'A treasury of gentle, illustrated tales for the perfect wind-down at bedtime',
    description: `101 short, soothing stories — from classic fables to brand-new tales — each paired with warm illustrations. Written in simple language perfect for reading aloud, this collection turns bedtime into the best part of the day.`,
    categories: ['story-books'],
    ageGroups: ['4-6', '6-8'],
    format: ['Story Book'],
    author: 'Ananya Desai',
    illustrator: 'Rohan Mehta',
    pages: 224,
    isbn: '978-93-00000-02-8',
    language: 'English',
    price: 335,
    comparePrice: 395,
    images: [
      { url: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800', alt: '101 Bedtime Stories' },
    ],
    benefits: [
      { title: '101 Short Stories', description: 'Perfectly sized tales for a 5-10 minute bedtime read.', icon: '🌙' },
      { title: 'Gentle Morals', description: 'Every story carries a simple, age-appropriate life lesson.', icon: '💛' },
      { title: 'Read-Aloud Friendly', description: 'Simple sentence structure makes it easy for parents to read aloud.', icon: '📖' },
    ],
    contents: ['101 illustrated stories', 'Full-colour illustrations', 'Hardcover with ribbon bookmark'],
    specifications: 'Size: 21cm x 27cm · Binding: Hardcover · Recommended for ages 4-8',
    stock: 80,
    isFeatured: true,
    isBestseller: true,
    tags: ['bedtime stories', 'story book', 'moral stories'],
    seoTitle: '101 Bedtime Stories — Illustrated Story Book for Kids | Clever Cat',
    seoDescription: 'A treasury of 101 gentle bedtime stories for ages 4-8, beautifully illustrated with simple read-aloud text.',
  },
  {
    name: 'Super-Cute Sticker & Colouring Activity Book',
    tagline: '100+ stickers and coloring pages bursting with adorable characters',
    description: `Hours of screen-free fun — over 100 stickers, colouring pages, and simple activities featuring adorable animal characters. Great for building fine motor skills and creativity, and easy to toss in a bag for travel or restaurant waits.`,
    categories: ['activity-books'],
    ageGroups: ['4-6', '6-8'],
    format: ['Activity Book', 'Colouring Book'],
    author: 'Clever Cat Studio',
    illustrator: 'Tara Iyer',
    pages: 48,
    isbn: '978-93-00000-03-5',
    language: 'English',
    price: 149,
    comparePrice: 199,
    images: [
      { url: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800', alt: 'Sticker & Colouring Activity Book' },
    ],
    benefits: [
      { title: '100+ Stickers', description: 'A huge sticker sheet included for endless sticking fun.', icon: '✨' },
      { title: 'Builds Fine Motor Skills', description: 'Colouring and sticking activities strengthen hand control.', icon: '✏️' },
      { title: 'Travel Friendly', description: 'Compact size fits easily into a bag for on-the-go entertainment.', icon: '🎒' },
    ],
    contents: ['100+ stickers', '30 colouring pages', '10 simple activity pages'],
    specifications: 'Size: 21cm x 21cm · Binding: Paperback · Recommended for ages 4-8',
    stock: 100,
    isFeatured: true,
    isBestseller: true,
    tags: ['stickers', 'colouring', 'activity book'],
    seoTitle: 'Super-Cute Sticker & Colouring Activity Book | Clever Cat',
    seoDescription: '100+ stickers and colouring pages for ages 4-8. Screen-free fun that builds fine motor skills.',
  },
  {
    name: 'I Love Unicorns — Colouring & Puzzle Book',
    tagline: 'Magical unicorns to colour, plus jigsaw-style puzzles hidden inside',
    description: `A dazzling colouring book filled with unicorns, rainbows, and magical creatures — plus a few surprise jigsaw-style puzzle pages tucked in between. A delightful gift for any unicorn-obsessed little one.`,
    categories: ['activity-books', 'puzzles'],
    ageGroups: ['4-6', '6-8'],
    format: ['Colouring Book', 'Puzzle'],
    author: 'Clever Cat Studio',
    illustrator: 'Simran Kaur',
    pages: 32,
    isbn: '978-93-00000-04-2',
    language: 'English',
    price: 89,
    comparePrice: 129,
    images: [
      { url: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800', alt: 'I Love Unicorns Colouring Book' },
    ],
    benefits: [
      { title: 'Magical Unicorn Theme', description: 'Every page filled with unicorns, rainbows and sparkle.', icon: '🦄' },
      { title: 'Bonus Puzzle Pages', description: 'A few jigsaw-style puzzle pages mixed in for variety.', icon: '🧩' },
      { title: 'Great Gift Pick', description: 'A popular pick for birthday goodie bags and small gifts.', icon: '🎁' },
    ],
    contents: ['32 colouring pages', '4 bonus puzzle pages'],
    specifications: 'Size: 21cm x 21cm · Binding: Paperback · Recommended for ages 4-8',
    stock: 90,
    isFeatured: true,
    isBestseller: false,
    tags: ['unicorns', 'colouring', 'puzzle'],
    seoTitle: 'I Love Unicorns — Colouring & Puzzle Book for Kids | Clever Cat',
    seoDescription: 'A magical unicorn-themed colouring and puzzle book for ages 4-8. A perfect small gift.',
  },
  {
    name: '1001 Ultimate Brain Booster Activities',
    tagline: 'A giant activity bundle of puzzles, mazes, and logic games for growing minds',
    description: `A bumper activity book packed with 1001 brain-boosting puzzles — mazes, spot-the-difference, logic grids, word searches and more. Designed to keep curious minds engaged while sharpening focus, memory, and problem-solving skills.`,
    categories: ['activity-books', 'puzzles'],
    ageGroups: ['6-8', '8-12'],
    format: ['Activity Book', 'Puzzle'],
    author: 'Clever Cat Studio',
    illustrator: 'Aditya Rao',
    pages: 320,
    isbn: '978-93-00000-05-9',
    language: 'English',
    price: 494,
    comparePrice: 549,
    images: [
      { url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800', alt: '1001 Ultimate Brain Booster Activities' },
    ],
    benefits: [
      { title: '1001 Activities', description: 'Months of puzzles, mazes and logic games in one bumper edition.', icon: '🧠' },
      { title: 'Sharpens Focus', description: 'Varied puzzle types keep attention and problem-solving skills growing.', icon: '🎯' },
      { title: 'Screen-Free Engagement', description: 'A satisfying alternative to screen time on long journeys or weekends.', icon: '📴' },
    ],
    contents: ['1001 puzzles & activities', 'Answer key included'],
    specifications: 'Size: 21cm x 27cm · Binding: Paperback · Recommended for ages 6-12',
    stock: 70,
    isFeatured: true,
    isBestseller: true,
    tags: ['brain booster', 'puzzles', 'activity book', 'logic'],
    seoTitle: '1001 Ultimate Brain Booster Activities — Puzzle Book | Clever Cat',
    seoDescription: '1001 puzzles, mazes and logic games for ages 6-12. A bumper brain-boosting activity book.',
  },
  {
    name: 'Jungle Animals Jigsaw Puzzle Book',
    tagline: 'A board book with 6 chunky jigsaw puzzles of jungle animals built right in',
    description: `A sturdy board book where every spread reveals a chunky jigsaw puzzle of a jungle animal — lion, elephant, giraffe and more. Removable puzzle pieces are perfectly sized for little fingers, building early problem-solving skills.`,
    categories: ['puzzles', 'board-books'],
    ageGroups: ['2-4', '4-6'],
    format: ['Board Book', 'Puzzle'],
    author: 'Clever Cat Studio',
    illustrator: 'Kabir Sharma',
    pages: 12,
    isbn: '978-93-00000-06-6',
    language: 'English',
    price: 165,
    comparePrice: 210,
    images: [
      { url: 'https://images.unsplash.com/photo-1594736797933-d0d62affc6d6?w=800', alt: 'Jungle Animals Jigsaw Puzzle Book' },
    ],
    benefits: [
      { title: '6 Chunky Puzzles', description: 'Six removable jigsaw puzzles built into a sturdy board book.', icon: '🧩' },
      { title: 'Little-Finger Friendly', description: 'Extra-large puzzle pieces sized for toddler hands.', icon: '🖐️' },
      { title: 'Early Problem Solving', description: 'Builds shape recognition and early spatial reasoning skills.', icon: '🧠' },
    ],
    contents: ['6 built-in jigsaw puzzles', '24 chunky puzzle pieces total'],
    specifications: 'Size: 20cm x 20cm · Binding: Board book · Recommended for ages 2-6',
    stock: 55,
    isFeatured: false,
    isBestseller: true,
    tags: ['puzzle', 'jungle animals', 'board book', 'toddler'],
    seoTitle: 'Jungle Animals Jigsaw Puzzle Book | Clever Cat',
    seoDescription: 'A board book with 6 built-in chunky jigsaw puzzles of jungle animals for ages 2-6.',
  },
  {
    name: 'Alphabet Flash Cards — Learn & Play Set',
    tagline: '26 sturdy, laminated flash cards to make learning the alphabet a game',
    description: `A set of 26 bright, laminated flash cards — one per letter — each paired with a fun illustration and example word. Wipe-clean and durable, perfect for flash-card games, matching activities, and early reading practice.`,
    categories: ['flash-cards'],
    ageGroups: ['2-4', '4-6'],
    format: ['Flash Cards'],
    author: 'Clever Cat Studio',
    illustrator: 'Neha Verma',
    pages: 26,
    isbn: '978-93-00000-07-3',
    language: 'English',
    price: 249,
    comparePrice: 299,
    images: [
      { url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800', alt: 'Alphabet Flash Cards Set' },
    ],
    benefits: [
      { title: '26 Laminated Cards', description: 'Durable, wipe-clean cards built to survive daily play.', icon: '🃏' },
      { title: 'Picture + Word Pairing', description: 'Each letter is paired with an illustration and example word.', icon: '🔤' },
      { title: 'Great for Flash-Card Games', description: 'Perfect size for matching games and quick-recall practice.', icon: '🎲' },
    ],
    contents: ['26 laminated flash cards', 'Sturdy storage box'],
    specifications: 'Card size: 10cm x 15cm · Recommended for ages 2-6',
    stock: 75,
    isFeatured: false,
    isBestseller: false,
    tags: ['flash cards', 'alphabet', 'early learning'],
    seoTitle: 'Alphabet Flash Cards — Learn & Play Set for Kids | Clever Cat',
    seoDescription: '26 laminated alphabet flash cards for ages 2-6. Wipe-clean, durable, great for early reading practice.',
  },
  {
    name: 'Sticker Wonder Craft Kit — Magical World',
    tagline: 'A hands-on craft kit with reusable stickers to build magical sticker scenes',
    description: `A creative craft kit with dozens of reusable, repositionable stickers and scene backgrounds featuring a magical world of castles, fairies and forests. Kids build their own scenes again and again — no glue, no mess.`,
    categories: ['craft-kits'],
    ageGroups: ['4-6', '6-8'],
    format: ['Craft Kit'],
    author: 'Clever Cat Studio',
    illustrator: 'Ishita Bose',
    pages: 24,
    isbn: '978-93-00000-08-0',
    language: 'English',
    price: 449,
    comparePrice: 549,
    images: [
      { url: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800', alt: 'Sticker Wonder Craft Kit' },
    ],
    benefits: [
      { title: 'Reusable Stickers', description: 'Repositionable stickers can be used again and again — no mess.', icon: '✨' },
      { title: 'Encourages Storytelling', description: 'Kids build their own magical scenes and invent stories around them.', icon: '📖' },
      { title: 'Screen-Free Creativity', description: 'A satisfying, mess-free craft activity for solo or group play.', icon: '🎨' },
    ],
    contents: ['200+ reusable stickers', '6 scene backgrounds', 'Carry-along folder'],
    specifications: 'Size: 24cm x 30cm folder · Recommended for ages 4-8',
    stock: 40,
    isFeatured: true,
    isBestseller: false,
    tags: ['craft kit', 'stickers', 'creative play'],
    seoTitle: 'Sticker Wonder Craft Kit — Magical World | Clever Cat',
    seoDescription: 'A reusable sticker craft kit for ages 4-8. Mess-free, encourages creativity and storytelling.',
  },
];

async function seed() {
  try {
    await connectDB();

    await Promise.all([
      Product.collection.drop().catch(() => {}),
      Category.collection.drop().catch(() => {}),
      Concern.collection.drop().catch(() => {}),
    ]);

    const createdCategories = await Category.insertMany(
      CATEGORIES.map((c, i) => ({ ...c, status: 'published', order: i }))
    );
    console.log(`✅ Seeded ${createdCategories.length} categories`);

    await Concern.insertMany(
      AGE_GROUPS.map((a, i) => ({ ...a, isActive: true, displayOrder: i }))
    );
    console.log(`✅ Seeded ${AGE_GROUPS.length} age-group cards`);

    const categoryBySlug = Object.fromEntries(createdCategories.map(c => [c.slug, c]));

    const created = [];
    for (const productData of products) {
      const categoryIds = (productData.categories || [])
        .map(slug => categoryBySlug[slug]?._id)
        .filter(Boolean);
      const product = await Product.create({ ...productData, categoryIds });
      created.push(product);
    }
    console.log(`✅ Seeded ${created.length} Clever Cat products`);

    const ids = created.map(p => p._id);
    await Promise.all([
      Product.findByIdAndUpdate(ids[0], { upsells: [ids[5], ids[6]] }),
      Product.findByIdAndUpdate(ids[1], { upsells: [ids[3], ids[7]] }),
      Product.findByIdAndUpdate(ids[2], { upsells: [ids[3], ids[7]] }),
      Product.findByIdAndUpdate(ids[3], { upsells: [ids[2], ids[5]] }),
    ]);
    console.log('✅ Upsells linked');

    await User.deleteMany({ role: 'admin' });
    await User.create({
      name: 'Clever Cat Admin',
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      role: 'admin',
    });
    console.log('✅ Admin user created');

    console.log('\n🎉 Clever Cat database seeded successfully!');
  } catch (err) {
    console.error('Seed error:', err);
    throw err;
  }
}

module.exports = seed;

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
