import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle, Sparkles, Star, Mail, Send, ChevronLeft, ChevronRight } from 'lucide-react'
import ProductCard from '../components/ui/ProductCard'
import HeroBannerSlider from '../components/ui/HeroBannerSlider'
import ShopByVideoSlider from '../components/ui/ShopByVideoSlider'
import GraphicDoodles from '../components/ui/GraphicDoodles'
import api from '../api'
import { getConcernTheme } from '../constants/concernThemes'

const isExternalUrl = (url) => /^https?:\/\//i.test(url || '')

// Default cards — shown when no active age-group cards are configured in the admin panel.
const DEFAULT_AGE_GROUPS = [
  { label: '0-2',  icon: '🍼', colorTheme: 'pink' },
  { label: '2-4',  icon: '🧸', colorTheme: 'orange' },
  { label: '4-6',  icon: '🎨', colorTheme: 'teal' },
  { label: '6-8',  icon: '📚', colorTheme: 'purple' },
  { label: '8-12', icon: '🧩', colorTheme: 'gold' },
  { label: '12+',  icon: '🚀', colorTheme: 'blue' },
]

const CATEGORY_COLORS = [
  { bg: '#F8F4F2', border: '#E0B9A7' }, // coral
  { bg: '#F8F6F1', border: '#E5D1B0' }, // tan
  { bg: '#F8F5F1', border: '#DEBFA3' }, // orange
  { bg: '#FFFAE6', border: '#FFE180' }, // yellow
  { bg: '#F7F4FA', border: '#B498E0' }, // purple
]

// Default pills — shown when no active price ranges are configured in the admin panel.
const DEFAULT_PRICE_TIERS = [
  { label: 'Under ₹199', maxPrice: 199 },
  { label: '₹200 – ₹499', maxPrice: 499 },
  { label: 'Above ₹500', maxPrice: 999 },
]

const TRUST = [
  { icon: '/original.png',           title: 'Original Products',  desc: 'Every book and toy sourced directly from publishers' },
  { icon: '/transaction.png',        title: 'Secure Payments',    desc: 'UPI, cards & net banking, fully encrypted' },
  { icon: '/fast-delivery.png',      title: 'Fast Shipping',      desc: 'Dispatched within 24 hours, pan-India delivery' },
  { icon: '/technical-support.png',  title: 'A+ Customer Support', desc: "We're here to help, every step of the way" },
]

const WHY_US = [
  { title: 'Hand-Picked for Every Age', desc: 'Every product is chosen and age-tagged so parents can shop with confidence.' },
  { title: 'Beautifully Designed', desc: 'Colourful, durable and built to survive real play — not just look good on a shelf.' },
  { title: 'Screen-Free Fun', desc: 'Books, puzzles and activity kits that keep curious minds engaged without a screen.' },
  { title: 'Gift-Ready, Always', desc: 'Add gift wrap at checkout — perfect for birthdays, festivals or a small surprise.' },
]

const TESTIMONIAL_COLORS = ['#611CD0', '#DC8660', '#16A34A', '#D77E2E', '#E3B771']

export default function HomePage() {
  const [bestsellers, setBestsellers] = useState([])
  const [newArrivals, setNewArrivals] = useState([])
  const [loading, setLoading] = useState(true)
  const [ageGroups, setAgeGroups] = useState(null)
  const [categories, setCategories] = useState([])
  const [priceRanges, setPriceRanges] = useState(null)
  const [testimonials, setTestimonials] = useState([])
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const [testimonialPaused, setTestimonialPaused] = useState(false)
  const categoryScrollRef = useRef(null)
  const [categoryPaused, setCategoryPaused] = useState(false)

  const scrollCategories = (dir) => {
    const el = categoryScrollRef.current
    if (!el) return
    const card = el.querySelector('[data-category-card]')
    const step = card ? card.offsetWidth + 16 : el.clientWidth * 0.8
    el.scrollBy({ left: dir * step, behavior: 'smooth' })
  }

  useEffect(() => {
    if (categoryPaused || categories.length < 3) return
    const timer = setInterval(() => {
      const el = categoryScrollRef.current
      if (!el) return
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 5) {
        el.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        scrollCategories(1)
      }
    }, 2800)
    return () => clearInterval(timer)
  }, [categoryPaused, categories.length])

  useEffect(() => {
    api.get('/testimonials/active')
      .then(({ data }) => setTestimonials(
        (data.testimonials || []).map((t, i) => ({ ...t, borderColor: TESTIMONIAL_COLORS[i % TESTIMONIAL_COLORS.length] }))
      ))
      .catch(() => setTestimonials([]))
  }, [])

  useEffect(() => {
    if (testimonialPaused || testimonials.length < 2) return
    const timer = setInterval(() => setActiveTestimonial(i => (i + 1) % testimonials.length), 3500)
    return () => clearInterval(timer)
  }, [testimonialPaused, testimonials.length])

  const goToTestimonial = (i) => setActiveTestimonial(((i % testimonials.length) + testimonials.length) % testimonials.length)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.get('/products?sort=popular&limit=8'),
      api.get('/products?sort=newest&limit=8'),
    ])
      .then(([bestRes, newRes]) => {
        setBestsellers(bestRes.data.products || [])
        setNewArrivals(newRes.data.products || [])
      })
      .catch(() => { setBestsellers([]); setNewArrivals([]) })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    api.get('/concerns/active')
      .then(({ data }) => setAgeGroups(data.concerns || []))
      .catch(() => setAgeGroups([]))
    api.get('/categories')
      .then(({ data }) => setCategories(data.categories || []))
      .catch(() => setCategories([]))
    api.get('/price-ranges/active')
      .then(({ data }) => setPriceRanges(data.priceRanges || []))
      .catch(() => setPriceRanges([]))
  }, [])

  const ageGroupCards = ageGroups && ageGroups.length > 0 ? ageGroups : DEFAULT_AGE_GROUPS
  const priceTiers = priceRanges && priceRanges.length > 0 ? priceRanges : DEFAULT_PRICE_TIERS

  return (
    <div className="min-h-screen overflow-x-hidden">

      {/* ── HERO ── */}
      <HeroBannerSlider />

      {/* ── TRUST BADGES ── */}
      <section className="bg-forest-900 py-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          {TRUST.map((t, i) => (
            <div key={t.title} className="flex flex-col items-center text-center gap-3">
              <div className="animate-float-icon" style={{ animationDelay: `${i * 0.2}s` }}>
                <div className="group" style={{ perspective: '600px' }}>
                  <img
                    src={t.icon}
                    alt={t.title}
                    className="w-16 h-16 object-contain drop-shadow-lg transition-transform duration-300 ease-out group-hover:[transform:rotateY(20deg)_rotateX(10deg)_scale(1.15)]"
                  />
                </div>
              </div>
              <h3 className="text-white font-display font-semibold text-sm">{t.title}</h3>
              <p className="text-orange-400 text-xs leading-relaxed">{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SHOP BY CATEGORY ── */}
      {categories.length > 0 && (
        <section className="relative py-16">
          {/* Full-bleed background pattern — spans the whole screen, not just the content column */}
          <img src="/bg_dashed-_orange.png.webp" alt="" aria-hidden="true"
            className="hidden lg:block absolute inset-x-0 top-0 w-full pointer-events-none select-none opacity-50 z-0" />

          <div className="relative z-10 px-4 max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <span className="badge-green mb-3 inline-block">Explore</span>
            <h2 className="section-title">Shop by Category</h2>
            <p className="text-forest-600 mt-3 max-w-xl mx-auto">Story books, puzzles, craft kits and more — organised the way parents actually shop</p>
          </div>

          <div
            className="relative group/carousel"
            onMouseEnter={() => setCategoryPaused(true)}
            onMouseLeave={() => setCategoryPaused(false)}
            onTouchStart={() => setCategoryPaused(true)}
            onTouchEnd={() => setCategoryPaused(false)}
          >
            <div
              ref={categoryScrollRef}
              className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {categories.map((c, i) => (
                <Link key={c._id} to={`/shop?category=${c.slug}`} data-category-card
                  className="relative flex-shrink-0 snap-start w-[46%] sm:w-[220px] aspect-[3/4.3] rounded-3xl overflow-hidden border-2 hover:scale-[1.03] transition-all duration-300 shadow-sm hover:shadow-xl"
                  style={{ background: CATEGORY_COLORS[i % CATEGORY_COLORS.length].bg, borderColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length].border }}>
                  {c.imageUrl ? (
                    <img src={c.imageUrl} alt={c.name} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4">
                      <span className="bg-white text-forest-900 text-sm font-display font-bold px-4 py-1.5 rounded-full shadow-sm text-center leading-tight">
                        {c.name}
                      </span>
                      <div className="text-6xl">{c.emoji}</div>
                    </div>
                  )}
                </Link>
              ))}
            </div>

            {categories.length > 2 && (
              <>
                <button onClick={() => scrollCategories(-1)} aria-label="Previous categories"
                  className="flex absolute left-1 sm:-left-4 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-forest-50 text-forest-900 rounded-full p-2 shadow-lg border border-forest-100 sm:opacity-0 sm:group-hover/carousel:opacity-100 transition-opacity">
                  <ChevronLeft size={20} />
                </button>
                <button onClick={() => scrollCategories(1)} aria-label="Next categories"
                  className="flex absolute right-1 sm:-right-4 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-forest-50 text-forest-900 rounded-full p-2 shadow-lg border border-forest-100 sm:opacity-0 sm:group-hover/carousel:opacity-100 transition-opacity">
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>
          </div>
        </section>
      )}

      {/* ── SHOP BY AGE ── */}
      <section className="relative py-16">
        <div className="relative z-10 px-4 max-w-7xl mx-auto">
        <GraphicDoodles items={[
          { src: '/red-plane.webp', className: '-top-2 -left-2 sm:-left-8 lg:-left-14 w-14 sm:w-20', delay: '0s' },
          { src: '/leaf-1_0ec42b3c-3a09-4729-b29e-274c4a6a908b.webp', className: 'top-4 -right-1 sm:-right-8 lg:-right-14 w-8 sm:w-10', delay: '0.4s' },
          { src: '/leaf-1_0ec42b3c-3a09-4729-b29e-274c4a6a908b.webp', className: 'hidden sm:block bottom-14 -left-4 lg:-left-10 w-9 -scale-x-100', delay: '0.9s' },
          { src: '/9f0a253f-598f-4a6a-af25-feabaa7e35c4.avif', className: 'hidden md:block -bottom-2 left-0 lg:-left-6 w-24 lg:w-28', delay: '0.2s' },
          { src: '/d67c5137-e870-4480-9bf8-88a59509fe56.avif', className: 'hidden md:block bottom-0 right-0 lg:-right-6 w-24 lg:w-28', delay: '0.6s' },
        ]} />
        <div className="relative text-center mb-10">
          <span className="badge-green mb-3 inline-block">Personalised Picks</span>
          <h2 className="section-title">Shop by Age</h2>
          <p className="text-forest-600 mt-3 max-w-xl mx-auto">Find the perfect books and learning products for every stage of your child's growth</p>
        </div>
        <div className="relative flex flex-wrap justify-center gap-4">
          {ageGroupCards.map((c, i) => {
            const theme = getConcernTheme(c.colorTheme)
            const target = c.link || `/shop?ageGroup=${encodeURIComponent(c.label)}`
            const cardClass = `bg-gradient-to-b ${theme.gradient} border ${theme.border} rounded-2xl p-4 text-center hover:scale-105 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md w-[calc((100%_-_1rem)/2)] sm:w-[160px] md:w-[190px]`
            const content = (
              <>
                {c.image ? (
                  <img src={c.image} alt={c.label} className="w-full aspect-square mx-auto mb-2 object-cover rounded-xl" />
                ) : (
                  <div className="text-3xl mb-2">{c.icon}</div>
                )}
                <p className="text-forest-900 text-sm font-semibold leading-tight">{c.label} years</p>
              </>
            )
            return isExternalUrl(target) ? (
              <a key={c._id || i} href={target} target="_blank" rel="noopener noreferrer" className={cardClass}>
                {content}
              </a>
            ) : (
              <Link key={c._id || i} to={target} className={cardClass}>
                {content}
              </Link>
            )
          })}
        </div>
        </div>
      </section>

      {/* ── SHOP BY PRICE ── */}
      <section className="py-4 px-4 max-w-7xl mx-auto">
        <div className="flex flex-wrap justify-center gap-4">
          {priceTiers.map(t => (
            <Link key={t._id || t.label} to={`/shop?maxPrice=${t.maxPrice}`}
              className="btn-outline-gold text-sm px-6 py-3">
              {t.label}
            </Link>
          ))}
        </div>
      </section>

      {/* ── BEST SELLERS ── */}
      <section className="py-16 px-4 bg-gradient-to-b from-forest-50 to-forest-100/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="badge-gold mb-3 inline-block">Our Products</span>
              <h2 className="section-title">Best Sellers</h2>
            </div>
            <Link to="/shop?sort=popular" className="text-forest-800 hover:text-forest-900 font-medium flex items-center gap-1 text-sm">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {loading ? (
              <div className="col-span-full text-center py-10 text-forest-500">Loading products…</div>
            ) : bestsellers.length > 0 ? (
              bestsellers.map(p => <ProductCard key={p._id} product={p} />)
            ) : (
              <div className="col-span-full text-center py-10 text-forest-500">No products available yet.</div>
            )}
          </div>
        </div>
      </section>

      {/* ── SHOP BY VIDEO ── */}
      <ShopByVideoSlider />

      {/* ── NEW ARRIVALS ── */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="badge-green mb-3 inline-block">Just In</span>
              <h2 className="section-title">New Arrivals</h2>
            </div>
            <Link to="/shop?sort=newest" className="text-forest-800 hover:text-forest-900 font-medium flex items-center gap-1 text-sm">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {loading ? (
              <div className="col-span-full text-center py-10 text-forest-500">Loading products…</div>
            ) : newArrivals.length > 0 ? (
              newArrivals.map(p => <ProductCard key={p._id} product={p} />)
            ) : (
              <div className="col-span-full text-center py-10 text-forest-500">No products available yet.</div>
            )}
          </div>
        </div>
      </section>

      {/* ── WHY CLEVER CAT ── */}
      <section className="relative py-16">
        <div className="relative z-10 px-4 max-w-7xl mx-auto">
        <GraphicDoodles items={[
          { src: '/Group-1-5.png', className: 'hidden sm:block -top-4 -left-4 lg:-left-12 w-16 sm:w-20', delay: '0.3s' },
          { src: '/2 (21).png', className: 'hidden sm:block -bottom-2 left-[8%] sm:left-[15%] w-10', delay: '0.7s' },
          { src: '/origamipperart-09.png', className: 'hidden xl:block top-1/2 -translate-y-1/2 -right-16 2xl:-right-24 w-32 xl:w-40 opacity-90', delay: '0.1s', animate: 'float-icon' },
        ]} />

        <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <img
              src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800"
              alt="Kids reading books"
              className="rounded-3xl shadow-xl w-full object-cover h-80"
            />
          </div>
          <div>
            <span className="badge-green mb-4 inline-block">Why Choose Us</span>
            <h2 className="section-title mb-6">Big Ideas for Little Minds</h2>
            <div className="space-y-5">
              {WHY_US.map(item => (
                <div key={item.title} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
                    style={{ background: 'linear-gradient(135deg,#4F29A3,#1D1538)' }}>
                    <CheckCircle size={16} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-forest-900 mb-1">{item.title}</h4>
                    <p className="text-forest-600 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/about" className="btn-gold mt-8 inline-flex">
              Learn Our Story <ArrowRight size={18} />
            </Link>
          </div>
        </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      {testimonials.length > 0 && (
      <section className="py-16 px-4 bg-forest-900 relative overflow-hidden">
        <Sparkles size={22} className="absolute top-8 left-[8%] text-gold-accent animate-twinkle" />
        <Star size={16} className="absolute bottom-10 right-[10%] text-gold-accent fill-gold-accent animate-twinkle" style={{ animationDelay: '0.6s' }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-10">
            <span className="badge-gold mb-3 inline-block">Parent Love</span>
            <h2 className="text-3xl md:text-4xl font-display font-semibold text-white">
              Loved by Parents Everywhere
            </h2>
          </div>

          {/* Coverflow carousel — center card highlighted, side cards recede with scale/blur/opacity */}
          <div
            className="relative h-[360px] sm:h-[340px] flex items-center justify-center"
            onMouseEnter={() => setTestimonialPaused(true)}
            onMouseLeave={() => setTestimonialPaused(false)}
          >
            {testimonials.map((t, i) => {
              let offset = i - activeTestimonial
              const n = testimonials.length
              if (offset > n / 2) offset -= n
              if (offset < -n / 2) offset += n

              const abs = Math.abs(offset)
              if (abs > 2) return null

              const isCenter = offset === 0
              const scale   = isCenter ? 1 : abs === 1 ? 0.82 : 0.68
              const opacity = isCenter ? 1 : abs === 1 ? 0.55 : 0.3
              const blur    = isCenter ? 0 : abs === 1 ? 1 : 2
              const spacing = 250

              return (
                <div
                  key={t._id}
                  onClick={() => !isCenter && goToTestimonial(activeTestimonial + offset)}
                  className={`absolute w-[280px] sm:w-[320px] bg-white rounded-2xl p-6 border-[3px] transition-all duration-500 ease-out ${isCenter ? 'shadow-2xl cursor-default' : 'shadow-lg cursor-pointer'}`}
                  style={{
                    borderColor: t.borderColor,
                    transform: `translateX(${offset * spacing}px) scale(${scale})`,
                    opacity,
                    filter: blur ? `blur(${blur}px)` : 'none',
                    zIndex: 10 - abs,
                  }}
                >
                  {t.image ? (
                    <img src={t.image} alt={t.name} className="w-16 h-16 rounded-full mx-auto mb-3 object-cover border-2" style={{ borderColor: t.borderColor }} />
                  ) : (
                    <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold text-xl"
                      style={{ background: t.borderColor }}>
                      {t.name.split(' ').map(w => w[0]).join('')}
                    </div>
                  )}
                  <div className="flex justify-center text-gold-accent text-base mb-3">
                    {'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}
                  </div>
                  <p className="text-forest-700 text-sm text-center leading-relaxed italic line-clamp-4">
                    "{t.text}"
                  </p>
                  <p className="text-center font-bold text-forest-900 mt-4">— {t.name}{t.city ? `, ${t.city}` : ''}</p>
                </div>
              )
            })}

            {testimonials.length > 1 && (
              <>
                <button onClick={() => goToTestimonial(activeTestimonial - 1)} aria-label="Previous testimonial"
                  className="absolute left-0 sm:left-4 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors">
                  <ChevronLeft size={20} />
                </button>
                <button onClick={() => goToTestimonial(activeTestimonial + 1)} aria-label="Next testimonial"
                  className="absolute right-0 sm:right-4 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors">
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>

          {/* Dots */}
          {testimonials.length > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              {testimonials.map((t, i) => (
                <button key={t._id} onClick={() => goToTestimonial(i)} aria-label={`Go to testimonial ${i + 1}`}
                  className={`h-2 rounded-full transition-all ${i === activeTestimonial ? 'w-6 bg-gold-accent' : 'w-2 bg-white/30 hover:bg-white/50'}`} />
              ))}
            </div>
          )}
        </div>
      </section>
      )}

      {/* ── NEWSLETTER ── */}
      <section className="py-10 px-4">
        <div className="relative max-w-5xl mx-auto rounded-2xl border border-forest-100 shadow-card px-6 py-5 flex flex-col md:flex-row items-center gap-5"
          style={{ background: 'linear-gradient(135deg, #FCFCFD, #F5F1FB)' }}>
          <div className="w-12 h-12 rounded-xl bg-forest-100 text-forest-700 flex items-center justify-center flex-shrink-0">
            <Mail size={22} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="font-display font-bold text-forest-900 text-lg">Be the first to know!</h2>
            <p className="text-forest-500 text-sm mt-0.5">Subscribe to get updates on our launch, new books and special offers.</p>
          </div>
          <form className="flex w-full md:w-auto gap-3" onSubmit={e => e.preventDefault()}>
            <input type="email" placeholder="Enter your email address" required
              className="flex-1 min-w-0 md:w-64 rounded-full border border-forest-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-800 focus:border-transparent" />
            <button type="submit" className="btn-gold whitespace-nowrap !px-6 !py-2.5">
              Notify Me <Send size={15} />
            </button>
          </form>
        </div>
      </section>

    </div>
  )
}
