const path = require('path');
const fs = require('fs');
const ShopVideo = require('../models/ShopVideo');
const { cloudinary } = require('../config/cloudinary');
const { recordMedia, forgetMedia } = require('../utils/mediaLog');

// multer-storage-cloudinary v4: file.path = secure_url, file.filename = public_id
// multer disk storage:          file.path = absolute fs path, file.filename = basename
const fileToVideo = (file, req) => {
  const isCloudinary = file.path?.startsWith('http');
  const backendOrigin = `${req.protocol}://${req.get('host')}`;
  return {
    url: isCloudinary ? file.path : `${backendOrigin}/uploads/shop-videos/${file.filename}`,
    publicId: isCloudinary ? file.filename : null,
  };
};

// Cloudinary auto-generates a JPG poster frame for any uploaded video at the
// same public path — swapping the extension avoids a separate thumbnail upload.
const withThumbnail = (doc) => {
  const obj = doc.toObject ? doc.toObject() : doc;
  return { ...obj, thumbnailUrl: obj.videoUrl.replace(/\.\w+(\?.*)?$/, '.jpg$1') };
};

const destroyCloudinaryVideo = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
  } catch (err) {
    console.error('[Cloudinary] destroy failed:', err.message);
  }
  await forgetMedia(publicId);
};

const deleteDiskVideo = (url) => {
  if (!url || url.startsWith('http')) return;
  const filePath = path.join(__dirname, '../../uploads/shop-videos', path.basename(url));
  fs.unlink(filePath, () => {});
};

// ─── GET /api/shop-videos/active — public, used by the storefront ─────────────
exports.getActiveShopVideos = async (_req, res) => {
  const videos = await ShopVideo.find({ isActive: true })
    .sort({ displayOrder: 1, createdAt: -1 })
    .populate('products', 'name slug price comparePrice images');

  res.json({ success: true, count: videos.length, videos: videos.map(withThumbnail) });
};

// ─── GET /api/shop-videos — admin, all videos ──────────────────────────────────
exports.getAllShopVideos = async (_req, res) => {
  const videos = await ShopVideo.find()
    .sort({ displayOrder: 1, createdAt: -1 })
    .populate('products', 'name slug price images');

  res.json({ success: true, count: videos.length, videos: videos.map(withThumbnail) });
};

// Multipart form fields with the same name arrive as a single string (one
// value) or an array (2+ values) depending on the client — normalize to array.
const toArray = (v) => (v === undefined ? [] : Array.isArray(v) ? v : [v]);

// ─── POST /api/shop-videos ───────────────────────────────────────────────────────
exports.createShopVideo = async (req, res) => {
  const { title, badge, views, products, displayOrder, isActive, video: videoUrl } = req.body;
  if (!req.file && !videoUrl) {
    return res.status(400).json({ success: false, message: 'Video file is required' });
  }
  const productIds = toArray(products);
  if (productIds.length === 0) {
    return res.status(400).json({ success: false, message: 'At least one tagged product is required' });
  }

  const video = req.file ? fileToVideo(req.file, req) : { url: videoUrl, publicId: null };
  if (req.file) await recordMedia(req.file, { source: 'shopVideo', label: title || undefined });

  const shopVideo = await ShopVideo.create({
    title: title || '',
    badge: badge || 'NEW',
    views: views ? Number(views) : 0,
    videoUrl: video.url,
    videoPublicId: video.publicId,
    products: productIds,
    displayOrder: displayOrder !== undefined ? Number(displayOrder) : 0,
    isActive: isActive === undefined ? true : (isActive === 'true' || isActive === true),
  });

  const populated = await shopVideo.populate('products', 'name slug price images');
  res.status(201).json({ success: true, video: withThumbnail(populated) });
};

// ─── PUT /api/shop-videos/:id ─────────────────────────────────────────────────────
exports.updateShopVideo = async (req, res) => {
  const shopVideo = await ShopVideo.findById(req.params.id);
  if (!shopVideo) return res.status(404).json({ success: false, message: 'Shop video not found' });

  const { title, badge, views, products, displayOrder, isActive, video: videoUrl } = req.body;

  if (req.file) {
    await destroyCloudinaryVideo(shopVideo.videoPublicId);
    deleteDiskVideo(shopVideo.videoUrl);
    await recordMedia(req.file, { source: 'shopVideo', label: title ?? shopVideo.title });
    const video = fileToVideo(req.file, req);
    shopVideo.videoUrl = video.url;
    shopVideo.videoPublicId = video.publicId;
  } else if (videoUrl !== undefined && videoUrl !== shopVideo.videoUrl) {
    shopVideo.videoUrl = videoUrl;
    shopVideo.videoPublicId = null;
  }

  if (title !== undefined) shopVideo.title = title;
  if (badge !== undefined) shopVideo.badge = badge;
  if (views !== undefined) shopVideo.views = Number(views);
  if (products !== undefined) {
    const productIds = toArray(products);
    if (productIds.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one tagged product is required' });
    }
    shopVideo.products = productIds;
  }
  if (displayOrder !== undefined) shopVideo.displayOrder = Number(displayOrder);
  if (isActive !== undefined) shopVideo.isActive = (isActive === 'true' || isActive === true);

  await shopVideo.save();
  const populated = await shopVideo.populate('products', 'name slug price images');
  res.json({ success: true, video: withThumbnail(populated) });
};

// ─── DELETE /api/shop-videos/:id ──────────────────────────────────────────────────
exports.deleteShopVideo = async (req, res) => {
  const shopVideo = await ShopVideo.findById(req.params.id);
  if (!shopVideo) return res.status(404).json({ success: false, message: 'Shop video not found' });

  await destroyCloudinaryVideo(shopVideo.videoPublicId);
  deleteDiskVideo(shopVideo.videoUrl);

  await shopVideo.deleteOne();
  res.json({ success: true, message: 'Shop video deleted' });
};

// ─── PUT /api/shop-videos/reorder ──────────────────────────────────────────────────
// body: { order: [{ _id, displayOrder }, ...] }
exports.reorderShopVideos = async (req, res) => {
  const { order } = req.body;
  if (!Array.isArray(order)) {
    return res.status(400).json({ success: false, message: 'order must be an array of { _id, displayOrder }' });
  }

  await Promise.all(
    order.map(({ _id, displayOrder }) => ShopVideo.findByIdAndUpdate(_id, { displayOrder }))
  );

  const videos = await ShopVideo.find().sort({ displayOrder: 1, createdAt: -1 }).populate('products', 'name slug price images');
  res.json({ success: true, videos: videos.map(withThumbnail) });
};
