import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, CheckCircle, ChevronLeft, ChevronRight, Star, Sparkles } from 'lucide-react'
import api from '../../api'

const AUTOPLAY_MS = 5000
const SWIPE_THRESHOLD = 50

const isExternalUrl = (url) => /^https?:\/\//i.test(url || '')

// Small decorative star/sparkle, absolutely positioned by the caller via className.
function Twinkle({ className, size = 20, delay = '0s', variant: Icon = Star }) {
  return (
    <Icon
      size={size}
      className={`absolute text-gold-accent fill-gold-accent animate-twinkle pointer-events-none ${className}`}
      style={{ animationDelay: delay }}
    />
  )
}

// Default static hero — shown when no active banners exist so the homepage
// never breaks/looks empty even before the admin configures any slides.
function StaticHero() {
  return (
    <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #42307B 0%, #1D1538 100%)' }}>
      {/* dot-grid texture */}
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: 'radial-gradient(#fff 1.5px, transparent 1.5px)', backgroundSize: '28px 28px' }}
      />

      {/* floating decorations */}
      <Twinkle className="top-10 left-[6%]" size={22} delay="0s" />
      <Twinkle className="top-24 right-[10%]" size={16} delay="0.4s" variant={Sparkles} />
      <Twinkle className="bottom-28 left-[18%]" size={14} delay="0.9s" />
      <Twinkle className="top-1/3 right-[4%]" size={26} delay="1.3s" variant={Sparkles} />

      <div className="max-w-7xl mx-auto px-4 pt-14 md:pt-20 pb-24 md:pb-28 grid md:grid-cols-2 gap-12 items-center relative">

        {/* Cloud-shaped speech-bubble */}
        <div className="relative pb-14 md:pb-20">
          <div className="cloud-shape bg-white px-8 pt-10 pb-16 md:px-12 md:pt-14 md:pb-20 shadow-2xl">
            <span className="badge-gold mb-4 inline-block">📚 Big Ideas for Little Minds</span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-forest-900 leading-tight mb-6">
              Books. Activities. <span className="gold-text">Play.</span>
            </h1>
            <p className="text-forest-700 text-lg leading-relaxed mb-8 max-w-lg">
              Beautifully designed books, puzzles and learning products that spark creativity and learning — chosen by age, loved by kids.
            </p>
            <div className="flex flex-wrap gap-4 mb-8">
              <Link to="/shop" className="btn-gold text-base px-8 py-4">
                Shop Now <ArrowRight size={18} />
              </Link>
              <Link to="/about" className="btn-outline-gold text-base px-8 py-4">
                Our Story
              </Link>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2 max-w-sm">
              {['Original Products', 'COD Available', 'Secure Payments', 'Fast Shipping'].map(tag => (
                <span key={tag} className="flex items-center gap-1.5 text-green-700 text-sm font-semibold">
                  <CheckCircle size={15} className="text-green-500" /> {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Floating "Shop by Category" cloud badge */}
          <Link to="/shop"
            className="cloud-badge absolute bottom-0 left-4 md:left-8 w-28 h-28 md:w-32 md:h-32 text-white leading-tight px-4 hover:scale-105 transition-transform duration-300 z-10"
            style={{ background: 'linear-gradient(135deg, #E3B771, #A16D1C)' }}>
            <span className="text-xs opacity-90">Shop by</span>
            <span className="text-base md:text-lg">Category</span>
          </Link>
        </div>

        {/* Mascot side */}
        <div className="relative flex justify-center">
          <div className="relative w-72 h-72 md:w-96 md:h-96 animate-bob">
            <div className="absolute inset-0 rounded-full opacity-30 blur-3xl"
              style={{ background: 'radial-gradient(circle, #D59051 0%, transparent 70%)' }} />
            <img
              src="/logo-white.png"
              alt="Clever Cat"
              className="relative w-full h-full object-contain drop-shadow-2xl"
            />
            {/* Floating badges */}
            <div className="absolute top-2 -left-6 md:-left-10 bg-white rounded-2xl shadow-xl p-3 border-4 border-orange-200 -rotate-6">
              <p className="text-xs text-forest-500 font-semibold">Best Seller</p>
              <p className="text-sm md:text-base font-bold text-forest-900 font-display">101 Bedtime Stories</p>
              <div className="flex text-gold-accent text-xs">★★★★★</div>
            </div>
            <div className="absolute bottom-6 -right-2 md:-right-6 rounded-2xl shadow-xl p-3 text-white rotate-6"
              style={{ background: 'linear-gradient(135deg, #DC8660, #91401D)' }}>
              <p className="text-xs opacity-90">Starting at</p>
              <p className="text-2xl font-bold font-display">₹89</p>
            </div>
          </div>
        </div>
      </div>

      {/* Wavy divider into the next section */}
      <svg className="absolute bottom-0 left-0 w-full h-10 md:h-16 text-cream-100" viewBox="0 0 1440 80" preserveAspectRatio="none" fill="currentColor">
        <path d="M0,32 C240,80 480,0 720,24 C960,48 1200,80 1440,32 L1440,80 L0,80 Z" />
      </svg>
    </section>
  )
}

export default function HeroBannerSlider() {
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const navigate = useNavigate()
  const touchStartX = useRef(null)

  useEffect(() => {
    api.get('/banners/active')
      .then(({ data }) => setBanners(data.banners || []))
      .catch(() => setBanners([]))
      .finally(() => setLoading(false))
  }, [])

  const total = banners.length

  const goTo = useCallback((index) => {
    setCurrent(((index % total) + total) % total)
  }, [total])

  // Autoplay — paused on hover and when there's only one slide
  useEffect(() => {
    if (total <= 1 || paused) return
    const timer = setInterval(() => setCurrent(c => (c + 1) % total), AUTOPLAY_MS)
    return () => clearInterval(timer)
  }, [total, paused])

  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX }
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return
    const delta = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(delta) > SWIPE_THRESHOLD) {
      goTo(current + (delta > 0 ? -1 : 1))
    }
    touchStartX.current = null
  }

  const handleNavigate = (url, e) => {
    e?.stopPropagation()
    if (!url) return
    if (isExternalUrl(url)) window.location.href = url
    else navigate(url)
  }

  if (loading) {
    return <div className="h-[420px] md:h-[560px] bg-forest-50 animate-pulse" />
  }

  if (total === 0) {
    return <StaticHero />
  }

  const banner = banners[current]

  return (
    <section
      className="relative overflow-hidden bg-forest-900 group"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className={`relative ${banner.clickUrl ? 'cursor-pointer' : ''}`}
        onClick={() => banner.clickUrl && handleNavigate(banner.clickUrl)}
      >
        <picture>
          {banner.mobileImage && (
            <source media="(max-width: 767px)" srcSet={banner.mobileImage} />
          )}
          <img
            src={banner.desktopImage}
            alt={banner.altText || banner.title}
            title={banner.title}
            className="w-full h-auto block"
            loading={current === 0 ? 'eager' : 'lazy'}
          />
        </picture>

        <div className="absolute inset-0 max-w-7xl mx-auto px-4 flex flex-col justify-center items-start z-10">
          <div className="max-w-lg text-white">
            {banner.subtitle && (
              <span className="badge-gold mb-4 inline-block">{banner.subtitle}</span>
            )}
            {banner.title && (
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 drop-shadow-md">
                {banner.title}
              </h1>
            )}
            <div className="flex flex-wrap gap-4">
              {banner.buttonText && (
                <button onClick={(e) => handleNavigate(banner.buttonUrl, e)} className="btn-gold text-base px-8 py-4">
                  {banner.buttonText} <ArrowRight size={18} />
                </button>
              )}
              {banner.secondaryButtonText && (
                <button onClick={(e) => handleNavigate(banner.secondaryButtonUrl, e)} className="btn-outline-gold !text-white !border-white text-base px-8 py-4">
                  {banner.secondaryButtonText}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {total > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); goTo(current - 1) }}
            aria-label="Previous slide"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-forest-900 rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); goTo(current + 1) }}
            aria-label="Next slide"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-forest-900 rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight size={22} />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); goTo(i) }}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-2 rounded-full transition-all ${i === current ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
