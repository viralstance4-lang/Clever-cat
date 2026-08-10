import { Heart, Star, Sparkles, BookOpen, PenLine, Send } from 'lucide-react'

const ICONS = { heart: Heart, star: Star, sparkles: Sparkles, book: BookOpen, pencil: PenLine, plane: Send }

/**
 * Scatters small decorative doodle icons (heart/star/book/pencil/plane) inside
 * a `relative` ancestor — playful accents for "moment" sections (hero, empty
 * states, celebration screens). Not meant for dense/transactional UI.
 *
 * items: [{ icon: 'star', className: 'top-10 left-[6%]', size?, delay?, tone?: 'gold'|'white'|'forest' }]
 */
export default function Doodles({ items }) {
  return (
    <>
      {items.map((item, i) => {
        const Icon = ICONS[item.icon] || Star
        const tone = item.tone === 'white' ? 'text-white/20'
          : item.tone === 'forest' ? 'text-forest-200'
          : 'text-gold-accent/50 fill-gold-accent/30'
        return (
          <Icon key={i} size={item.size || 18}
            className={`absolute pointer-events-none animate-twinkle ${tone} ${item.className || ''}`}
            style={{ animationDelay: item.delay || '0s' }} />
        )
      })}
    </>
  )
}
