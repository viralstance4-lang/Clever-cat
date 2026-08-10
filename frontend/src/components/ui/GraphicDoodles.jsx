/**
 * Scatters small decorative illustration assets (paper plane, leaf, smiley
 * cloud/sun, flowers, mascots — the hand-drawn PNG/WEBP/AVIF stickers in
 * /public) inside a `relative` ancestor. Sibling to Doodles.jsx, which does
 * the same job for lucide-icon doodles instead of image assets.
 *
 * items: [{ src: '/red-plane.webp', className: 'top-4 left-4 w-16', delay?: '0s', animate?: 'bob'|'float-icon'|'none' }]
 */
export default function GraphicDoodles({ items }) {
  return (
    <>
      {items.map((item, i) => (
        <img
          key={i}
          src={item.src}
          alt=""
          aria-hidden="true"
          className={`absolute pointer-events-none select-none drop-shadow-sm ${item.animate !== 'none' ? `animate-${item.animate || 'bob'}` : ''} ${item.className || ''}`}
          style={{ animationDelay: item.delay || '0s' }}
        />
      ))}
    </>
  )
}
