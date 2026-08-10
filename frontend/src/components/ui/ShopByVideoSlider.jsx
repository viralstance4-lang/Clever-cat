import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Play, Eye, X, ArrowRight, BookOpen } from 'lucide-react'
import api from '../../api'

const formatViews = (n) => {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n || 0)
}

function PriceTag({ product, className = '' }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {product.comparePrice > product.price && (
        <span className="text-white/50 text-xs line-through">₹{product.comparePrice}</span>
      )}
      <span className="text-white text-sm font-bold">₹{product.price}</span>
    </div>
  )
}

export default function ShopByVideoSlider() {
  const [videos, setVideos] = useState([])
  const [heading, setHeading] = useState("Parent's Choice")
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(null)
  const lightbox = lightboxIndex !== null ? videos[lightboxIndex] : null

  useEffect(() => {
    api.get('/shop-videos/active')
      .then(({ data }) => setVideos(data.videos || []))
      .catch(() => setVideos([]))
    api.get('/settings')
      .then(({ data }) => { if (data.settings?.shopVideoHeading) setHeading(data.settings.shopVideoHeading) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (paused || lightbox || videos.length < 2) return
    const timer = setInterval(() => setActive(i => (i + 1) % videos.length), 4000)
    return () => clearInterval(timer)
  }, [paused, lightbox, videos.length])

  const goTo = (i) => setActive(((i % videos.length) + videos.length) % videos.length)

  const goLightbox = (delta) => setLightboxIndex(i => {
    const next = ((i + delta) % videos.length + videos.length) % videos.length
    setActive(next)
    return next
  })

  useEffect(() => {
    if (lightboxIndex === null) return
    const onKey = (e) => {
      if (e.key === 'ArrowRight') goLightbox(1)
      else if (e.key === 'ArrowLeft') goLightbox(-1)
      else if (e.key === 'Escape') setLightboxIndex(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxIndex, videos.length])

  const touchStartX = useRef(null)
  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX }
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) > 50) goLightbox(dx < 0 ? 1 : -1)
    touchStartX.current = null
  }

  if (videos.length === 0) return null

  return (
    <section className="py-16 px-4 bg-gold-gradient relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-display font-semibold text-white flex items-center justify-center gap-3">
            <BookOpen className="text-white animate-twinkle" size={28} />
            {heading}
            <BookOpen className="text-white animate-twinkle" size={28} style={{ animationDelay: '0.6s' }} />
          </h2>
        </div>

        {/* Coverflow carousel — center card highlighted, side cards recede with scale/opacity */}
        <div
          className="relative h-[400px] sm:h-[440px] flex items-center justify-center"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {videos.map((v, i) => {
            let offset = i - active
            const n = videos.length
            if (offset > n / 2) offset -= n
            if (offset < -n / 2) offset += n

            const abs = Math.abs(offset)
            if (abs > 2) return null

            const isCenter = offset === 0
            const scale = isCenter ? 1 : abs === 1 ? 0.82 : 0.68
            const opacity = isCenter ? 1 : abs === 1 ? 0.55 : 0.3
            const spacing = 210

            const product = v.product

            return (
              <div
                key={v._id}
                onClick={() => isCenter ? setLightboxIndex(i) : goTo(active + offset)}
                className={`absolute w-[210px] sm:w-[230px] aspect-[9/16] rounded-2xl overflow-hidden border-2 border-white/10 transition-all duration-500 ease-out cursor-pointer bg-forest-800 ${isCenter ? 'shadow-2xl' : 'shadow-lg'}`}
                style={{
                  transform: `translateX(${offset * spacing}px) scale(${scale})`,
                  opacity,
                  zIndex: 10 - abs,
                }}
              >
                {isCenter ? (
                  <video
                    key={v._id}
                    src={v.videoUrl}
                    poster={v.thumbnailUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <img src={v.thumbnailUrl} alt={v.title || product?.name} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/5 to-black/40" />

                <div className="absolute top-3 left-3 bg-white text-forest-900 text-[10px] font-bold px-2 py-1 rounded-full">{v.badge}</div>
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/40 text-white text-[10px] font-semibold px-2 py-1 rounded-full">
                  <Eye size={11} /> {formatViews(v.views)}
                </div>

                {!isCenter && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="w-12 h-12 rounded-full bg-white/25 backdrop-blur flex items-center justify-center">
                      <Play size={20} className="text-white fill-white ml-0.5" />
                    </span>
                  </div>
                )}

                {product && (
                  <div className="absolute bottom-0 inset-x-0 p-3 flex items-center gap-2">
                    {product.images?.[0]?.url && (
                      <img src={product.images[0].url} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0 border border-white/30" />
                    )}
                    <div className="min-w-0">
                      <p className="text-white text-xs font-semibold line-clamp-2 mb-1">{v.title || product.name}</p>
                      <PriceTag product={product} />
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {videos.length > 1 && (
            <>
              <button onClick={() => goTo(active - 1)} aria-label="Previous video"
                className="absolute left-0 sm:left-4 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors">
                <ChevronLeft size={20} />
              </button>
              <button onClick={() => goTo(active + 1)} aria-label="Next video"
                className="absolute right-0 sm:right-4 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors">
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </div>

        {videos.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            {videos.map((v, i) => (
              <button key={v._id} onClick={() => goTo(i)} aria-label={`Go to video ${i + 1}`}
                className={`h-2 rounded-full transition-all ${i === active ? 'w-6 bg-gold-accent' : 'w-2 bg-white/30 hover:bg-white/50'}`} />
            ))}
          </div>
        )}
      </div>

      {/* Lightbox — bigger video + tagged product, click-through to product page */}
      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setLightboxIndex(null)}>
          <div className="absolute inset-0 bg-black/80" />
          <div className="relative w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <button onClick={() => setLightboxIndex(null)} aria-label="Close"
              className="absolute -top-10 right-0 text-white/80 hover:text-white transition-colors">
              <X size={26} />
            </button>
            <div
              className="relative rounded-2xl overflow-hidden bg-black aspect-[9/16]"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <video key={lightbox._id} src={lightbox.videoUrl} controls autoPlay playsInline className="w-full h-full object-contain" />

              {videos.length > 1 && (
                <>
                  <button onClick={() => goLightbox(-1)} aria-label="Previous video"
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition-colors">
                    <ChevronLeft size={20} />
                  </button>
                  <button onClick={() => goLightbox(1)} aria-label="Next video"
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition-colors">
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>
            {lightbox.product && (
              <Link to={`/shop/${lightbox.product.slug}`}
                className="mt-3 flex items-center justify-between gap-3 bg-white rounded-xl p-3 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 min-w-0">
                  <img src={lightbox.product.images?.[0]?.url} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0 bg-forest-50" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-forest-900 truncate">{lightbox.product.name}</p>
                    <div className="flex items-center gap-2">
                      {lightbox.product.comparePrice > lightbox.product.price && (
                        <span className="text-forest-400 text-xs line-through">₹{lightbox.product.comparePrice}</span>
                      )}
                      <span className="text-forest-900 text-sm font-bold">₹{lightbox.product.price}</span>
                    </div>
                  </div>
                </div>
                <span className="btn-gold text-xs flex-shrink-0 whitespace-nowrap">View Product <ArrowRight size={14} /></span>
              </Link>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
