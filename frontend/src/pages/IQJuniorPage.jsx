import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { Check, Star, Sparkles, Heart, ShoppingCart, Minus, Plus, ZoomIn, ZoomOut, X, ChevronLeft, ChevronRight } from 'lucide-react'
import useCartStore from '../store/cartStore'
import { cldOptimize } from '../utils/cloudinary'
import useWishlist from '../hooks/useWishlist'
import toast from 'react-hot-toast'
import api from '../api'

const TIERS = [
  {
    key: 'pre-primary',
    slug: 'iq-junior-magazine-pre-primary',
    badge: 'AGES 3-5',
    cardTitle: 'PRE PRIMARY',
    cardImage: 'https://res.cloudinary.com/eob3oguc/image/upload/v1791961266/clevercat/media/dgqxwngw5cox9jhb2qqj.jpg',
    galleryImages: [
      { url: 'https://res.cloudinary.com/eob3oguc/image/upload/v1792047727/clevercat/media/xsyq91f6sze56t758wfc.jpg', alt: 'IQ Junior — Pre-Primary cover' },
      { url: 'https://res.cloudinary.com/eob3oguc/image/upload/v1792047724/clevercat/media/naedluithaibjygfiegn.jpg', alt: 'IQ Junior — Pre-Primary inside page' },
      { url: 'https://res.cloudinary.com/eob3oguc/image/upload/v1792047726/clevercat/media/dmhc8xjdqwrulos3xf0h.jpg', alt: 'IQ Junior — Pre-Primary inside page' },
    ],
    accent: 'purple',
    magazineTitle: 'IQ Junior Magazine — Pre-Primary',
    ageLine: 'For Ages 3–5 Years',
    subscription: 'Annual Subscription · 12 Issues',
    price: '₹1,199',
    tagline: 'Learning, Discovery & Fun!',
    description: 'A delightful educational magazine for little learners, packed with engaging content that introduces children to the world around them through fun, age-appropriate learning experiences.',
    features: [
      'Engaging, Age-Appropriate Learning Activities',
      'A Variety of Topics for Little Learners',
      'Activities Supporting Early Learning and Development',
      'Skills Clearly Identified for Each Activity',
    ],
  },
  {
    key: 'classes-1-2',
    slug: 'iq-junior-magazine-classes-1-2',
    badge: 'AGES 6-8',
    cardTitle: 'CLASS 1 & 2',
    cardImage: 'https://res.cloudinary.com/eob3oguc/image/upload/v1791961268/clevercat/media/hlhkgfzvdtfy2vvmryin.jpg',
    galleryImages: [
      { url: 'https://res.cloudinary.com/eob3oguc/image/upload/v1792048550/clevercat/media/coqmjigcvkymknmqrqz9.jpg', alt: 'IQ Junior — Classes 1 & 2 cover' },
      { url: 'https://res.cloudinary.com/eob3oguc/image/upload/v1792048548/clevercat/media/wfp0bvew6yyfexjycrms.jpg', alt: 'IQ Junior — Classes 1 & 2 inside page' },
      { url: 'https://res.cloudinary.com/eob3oguc/image/upload/v1792048549/clevercat/media/mgc3nt2cxebjjst65ygk.jpg', alt: 'IQ Junior — Classes 1 & 2 inside page' },
    ],
    accent: 'orange',
    magazineTitle: 'IQ Junior Magazine — Classes 1 & 2',
    ageLine: 'For Ages 6–7 Years',
    subscription: 'Annual Subscription · 12 Issues',
    price: '₹1,199',
    tagline: 'Learning, Discovery & Fun!',
    description: 'A delightful educational magazine for little learners, packed with engaging content that introduces children to the world around them through fun, age-appropriate learning experiences.',
    features: [
      'Engaging, Knowledge-Building Activities',
      'A Wide Range of Educational Topics',
      'Activities Encouraging Logical Thinking and Problem-Solving',
      'Skills Clearly Identified for Each Activity',
    ],
  },
]

function MagazineGallery({ tier }) {
  const images = tier.galleryImages || [{ url: tier.cardImage, alt: `IQ Junior — ${tier.cardTitle}` }]
  const [activeImg, setActiveImg] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [zoomLevel, setZoomLevel] = useState(1)

  const openLightbox = (index) => { setLightboxIndex(index); setZoomLevel(1); setLightboxOpen(true) }
  const closeLightbox = () => setLightboxOpen(false)
  const lightboxGoTo = (index) => { setLightboxIndex(((index % images.length) + images.length) % images.length); setZoomLevel(1) }
  const zoomIn = () => setZoomLevel(z => Math.min(3, +(z + 0.5).toFixed(1)))
  const zoomOut = () => setZoomLevel(z => Math.max(1, +(z - 0.5).toFixed(1)))

  useEffect(() => {
    if (!lightboxOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') closeLightbox()
      else if (e.key === 'ArrowRight') lightboxGoTo(lightboxIndex + 1)
      else if (e.key === 'ArrowLeft') lightboxGoTo(lightboxIndex - 1)
      else if (e.key === '+' || e.key === '=') zoomIn()
      else if (e.key === '-') zoomOut()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxOpen, lightboxIndex])

  return (
    <>
      <div
        className={`relative w-full max-w-[260px] aspect-[3/4] rounded-2xl border-2 bg-white overflow-hidden transition-transform duration-300 hover:scale-105 hover:-rotate-1 cursor-pointer ${tier.accent === 'purple' ? 'border-forest-700' : 'border-gold-500'}`}
        onClick={() => openLightbox(activeImg)}
      >
        <img src={cldOptimize(images[activeImg].url, 500)} alt={images[activeImg].alt} className="w-full h-full object-contain" />
        <span className={`absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full text-white animate-bob-soft ${tier.accent === 'purple' ? 'bg-gold-500' : 'bg-forest-900'}`}>
          {tier.badge}
        </span>
        <span className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/50 text-white text-[10px] font-medium px-2.5 py-1 rounded-full pointer-events-none">
          <ZoomIn size={11} /> Click to zoom
        </span>
      </div>

      {images.length > 1 && (
        <div className="flex gap-2.5 mt-3 w-full max-w-[260px]">
          {images.map((img, i) => (
            <button key={i} onClick={(e) => { e.stopPropagation(); setActiveImg(i) }}
              className={`flex-1 aspect-square rounded-xl overflow-hidden border-2 transition-all ${activeImg === i ? (tier.accent === 'purple' ? 'border-forest-700' : 'border-gold-500') : 'border-forest-100 opacity-60 hover:opacity-100'}`}>
              <img src={cldOptimize(img.url, 160)} alt={img.alt} loading="lazy" className="w-full h-full object-contain" />
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && createPortal(
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col" onClick={closeLightbox}>
          <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
            <span className="text-white/70 text-sm">{lightboxIndex + 1} / {images.length}</span>
            <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
              <button onClick={zoomOut} disabled={zoomLevel <= 1} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ZoomOut size={18} /></button>
              <span className="text-white/70 text-xs w-10 text-center">{Math.round(zoomLevel * 100)}%</span>
              <button onClick={zoomIn} disabled={zoomLevel >= 3} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ZoomIn size={18} /></button>
              <button onClick={closeLightbox} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors ml-2"><X size={18} /></button>
            </div>
          </div>

          <div className="flex-1 relative flex items-center justify-center overflow-auto px-4" onClick={e => e.stopPropagation()}>
            {images.length > 1 && (
              <button onClick={() => lightboxGoTo(lightboxIndex - 1)} aria-label="Previous image"
                className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 sm:p-3 transition-colors"><ChevronLeft size={22} /></button>
            )}
            <img src={cldOptimize(images[lightboxIndex].url, 1600)} alt={images[lightboxIndex].alt}
              className="max-h-[75vh] max-w-full object-contain transition-transform duration-200 cursor-zoom-in select-none"
              style={{ transform: `scale(${zoomLevel})` }}
              onClick={() => (zoomLevel >= 3 ? setZoomLevel(1) : zoomIn())} />
            {images.length > 1 && (
              <button onClick={() => lightboxGoTo(lightboxIndex + 1)} aria-label="Next image"
                className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 sm:p-3 transition-colors"><ChevronRight size={22} /></button>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex items-center justify-center gap-2 py-4 flex-shrink-0" onClick={e => e.stopPropagation()}>
              {images.map((img, i) => (
                <button key={i} onClick={() => lightboxGoTo(i)}
                  className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${lightboxIndex === i ? 'border-white' : 'border-white/20 opacity-50 hover:opacity-80'}`}>
                  <img src={cldOptimize(img.url, 96)} alt={img.alt} loading="lazy" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>,
        document.body
      )}
    </>
  )
}

function MagazineCard({ tier, product }) {
  const [qty, setQty] = useState(1)
  const addItem = useCartStore(s => s.addItem)
  const { isWishlisted, toggleWishlist } = useWishlist()

  const handleAddToCart = () => {
    if (!product) return
    addItem(product, qty, null, null)
    toast.success(`${product.name} added to cart!`)
  }

  return (
    <div className="flex flex-col items-center">
      <MagazineGallery tier={tier} />

      <div className="w-full max-w-[260px] mt-6">
        {/* Qty + Add to cart */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center border-2 border-forest-200 rounded-full overflow-hidden">
            <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-2.5 hover:bg-forest-50 text-forest-700">
              <Minus size={14} />
            </button>
            <span className="w-8 text-center font-semibold text-forest-900 text-sm">{qty}</span>
            <button onClick={() => setQty(q => q + 1)} className="px-3 py-2.5 hover:bg-forest-50 text-forest-700">
              <Plus size={14} />
            </button>
          </div>
          <button onClick={handleAddToCart} disabled={!product}
            className="btn-gold flex-1 justify-center gap-1.5 px-3 py-3 text-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed">
            <ShoppingCart size={15} className="flex-shrink-0" /> Add to Cart
          </button>
        </div>

        {/* Buy now + Wishlist */}
        <div className="flex gap-3">
          <Link to="/checkout" onClick={handleAddToCart}
            className={`btn-green flex-1 justify-center py-3 text-sm ${!product ? 'pointer-events-none opacity-50' : ''}`}>
            Buy Now — ₹{(product?.price ?? 1199) * qty}
          </Link>
          <button
            onClick={() => product && toggleWishlist(product._id)}
            disabled={!product}
            aria-label={product && isWishlisted(product._id) ? 'Remove from wishlist' : 'Add to wishlist'}
            className={`p-3 rounded-full border-2 transition-colors flex-shrink-0 ${
              product && isWishlisted(product._id)
                ? 'border-red-300 text-red-500'
                : 'border-forest-200 hover:border-red-300 hover:text-red-400 text-forest-400'
            }`}
          >
            <Heart size={18} fill={product && isWishlisted(product._id) ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>
    </div>
  )
}

function FeatureList({ tier }) {
  const isPurple = tier.accent === 'purple'
  return (
    <div>
      <span className={`text-xs font-bold tracking-widest uppercase ${isPurple ? 'text-gold-600' : 'text-forest-700'}`}>Key Features</span>
      <h2 className="section-title mt-2 mb-2">{tier.magazineTitle}</h2>
      <p className="text-forest-500 text-sm mb-4">{tier.ageLine} · {tier.subscription} · <span className="font-bold text-forest-900">{tier.price}</span></p>
      <p className={`font-bold mb-3 ${isPurple ? 'text-forest-700' : 'text-gold-600'}`}>{tier.tagline}</p>
      <p className="text-forest-600 leading-relaxed mb-6">{tier.description}</p>
      <div className="space-y-3">
        {tier.features.map(f => (
          <div key={f} className="flex items-start gap-3 bg-forest-50/60 rounded-xl p-3">
            <span className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${isPurple ? 'bg-forest-100 text-forest-700' : 'bg-gold-100 text-gold-600'}`}>
              <Check size={14} />
            </span>
            <span className="text-sm font-medium text-forest-800">{f}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function IQJuniorPage() {
  const [products, setProducts] = useState({})

  useEffect(() => {
    TIERS.forEach(tier => {
      api.get(`/products/${tier.slug}`)
        .then(({ data }) => setProducts(p => ({ ...p, [tier.slug]: data.product })))
        .catch(() => {})
    })
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-forest-900 py-16 px-4 text-center relative overflow-hidden">
        <Sparkles size={24} className="absolute top-8 left-[10%] text-gold-accent animate-twinkle" />
        <Star size={18} className="absolute top-12 right-[12%] text-gold-accent fill-gold-accent animate-twinkle" style={{ animationDelay: '0.6s' }} />
        <Heart size={18} className="absolute bottom-8 left-[18%] text-pink-300 fill-pink-300 animate-bob" style={{ animationDelay: '0.3s' }} />
        <Star size={14} className="absolute bottom-10 right-[20%] text-gold-accent fill-gold-accent animate-twinkle" style={{ animationDelay: '1s' }} />
        <span className="badge-gold mb-4 inline-block">New Launch</span>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'PP Pangram Sans Rounded',sans-serif" }}>
          IQ Junior Magazine
        </h1>
        <p className="text-forest-300 max-w-xl mx-auto text-lg">
          An educational magazine subscription that makes learning, discovery and fun part of every month.
        </p>
      </div>

      <div className="relative">
        {/* Mobile browsers largely ignore bg-fixed attachment, so use a plain
            scrolling background with its own image on small screens. */}
        <div
          className="absolute inset-0 bg-cover bg-top sm:hidden"
          style={{ backgroundImage: `url('${cldOptimize('https://res.cloudinary.com/eob3oguc/image/upload/v1791964591/clevercat/media/shjw1dyj5thamxpysos0.jpg', 900)}')` }}
        />
        <div
          className="hidden sm:block absolute inset-0 bg-cover bg-center bg-fixed"
          style={{ backgroundImage: `url('${cldOptimize('https://res.cloudinary.com/eob3oguc/image/upload/v1791964118/clevercat/media/vfhbpa0iu869zghcpph7.jpg', 1600)}')` }}
        />

        {/* Pre-Primary — image left, text right */}
        <section className="relative z-10 pt-24 pb-8 sm:pt-16 sm:pb-8 px-4 max-w-6xl mx-auto">
          <Star size={20} className="hidden sm:block absolute top-4 left-6 text-gold-accent fill-gold-accent animate-twinkle" />
          <Sparkles size={22} className="absolute -top-2 right-8 sm:right-16 text-forest-700 animate-float-icon" />
          <Heart size={16} className="hidden sm:block absolute bottom-8 left-20 text-pink-400 fill-pink-400 animate-bob" style={{ animationDelay: '0.4s' }} />
          <div className="grid md:grid-cols-2 gap-12 items-center bg-white/25 sm:bg-white/30 backdrop-blur-md sm:backdrop-blur-lg rounded-3xl p-6 md:p-10 shadow-sm sm:shadow-xl sm:border sm:border-white/40">
            <MagazineCard tier={TIERS[0]} product={products[TIERS[0].slug]} />
            <FeatureList tier={TIERS[0]} />
          </div>
        </section>

        {/* Classes 1 & 2 — text left, image right */}
        <section className="relative z-10 pt-8 pb-24 sm:pt-8 sm:pb-16 px-4">
          <Sparkles size={22} className="hidden sm:block absolute top-6 left-[14%] text-gold-accent animate-twinkle" style={{ animationDelay: '0.5s' }} />
          <Star size={18} className="absolute -top-1 right-10 sm:right-[18%] text-forest-700 fill-forest-700 animate-float-icon" style={{ animationDelay: '0.2s' }} />
          <Heart size={16} className="hidden sm:block absolute bottom-10 right-16 text-pink-400 fill-pink-400 animate-bob" style={{ animationDelay: '0.7s' }} />
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center bg-white/25 sm:bg-white/30 backdrop-blur-md sm:backdrop-blur-lg rounded-3xl p-6 md:p-10 shadow-sm sm:shadow-xl sm:border sm:border-white/40">
            <div className="order-2 md:order-1">
              <FeatureList tier={TIERS[1]} />
            </div>
            <div className="order-1 md:order-2">
              <MagazineCard tier={TIERS[1]} product={products[TIERS[1].slug]} />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
