const Media = require('../models/Media');

const typeFromMime = (mimetype) => {
  if (mimetype === 'application/pdf') return 'pdf';
  if (mimetype?.startsWith('video/')) return 'video';
  return 'image';
};

// Logs a Cloudinary upload into the shared Media Library so every asset
// uploaded anywhere in the admin (products, banners, concerns, media library)
// shows up in one place and can be cleaned up from there.
exports.recordMedia = async (file, { source = 'library', label = '' } = {}) => {
  if (!file?.path?.startsWith('http')) return; // disk-fallback uploads have no Cloudinary asset to track
  try {
    await Media.create({
      url:      file.path,
      publicId: file.filename,
      type:     typeFromMime(file.mimetype),
      filename: file.originalname,
      format:   file.mimetype?.split('/')[1] || '',
      size:     file.size || 0,
      source,
      label,
    });
  } catch (err) {
    console.error('[Media] failed to log upload:', err.message);
  }
};

// Removes the Media Library record for a Cloudinary asset that a feature is
// deleting/replacing on its own — keeps the library from listing dead links.
exports.forgetMedia = async (publicId) => {
  if (!publicId) return;
  await Media.deleteOne({ publicId }).catch(() => {});
};
