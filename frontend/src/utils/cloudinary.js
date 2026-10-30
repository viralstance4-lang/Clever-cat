// Inserts Cloudinary delivery transforms (auto format + auto quality + a width
// cap) into a Cloudinary URL, so the CDN serves a right-sized WebP/AVIF instead
// of the original upload. Non-Cloudinary URLs (local files, other hosts) pass
// through unchanged. Safe to call on any image src.
export function cldOptimize(url, width) {
  if (!url || typeof url !== 'string') return url
  const marker = '/image/upload/'
  const i = url.indexOf(marker)
  if (i === -1) return url
  const transforms = width ? `f_auto,q_auto,w_${width}` : 'f_auto,q_auto'
  return url.slice(0, i + marker.length) + transforms + '/' + url.slice(i + marker.length)
}
