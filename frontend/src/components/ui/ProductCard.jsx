import { Link } from 'react-router-dom'
import { ShoppingCart, Heart, Star } from 'lucide-react'
import useCartStore from '../../store/cartStore'
import useWishlist from '../../hooks/useWishlist'
import toast from 'react-hot-toast'
import { cldOptimize } from '../../utils/cloudinary'

export default function ProductCard({ product }) {
  const addItem = useCartStore(s => s.addItem)
  const { isWishlisted, toggleWishlist } = useWishlist()
  const wishlisted = isWishlisted(product._id)
  const cheapestPkg = product.packageVariants?.length
    ? product.packageVariants.reduce((min, pv) => pv.price < min.price ? pv : min)
    : null
  const discountBasis = cheapestPkg || product
  const discount = discountBasis.comparePrice
    ? Math.round(((discountBasis.comparePrice - discountBasis.price) / discountBasis.comparePrice) * 100)
    : 0

  const handleAddToCart = (e) => {
    e.preventDefault()
    if (product.isComingSoon) return
    addItem(product)
    toast.success(`${product.name} added to cart!`)
    if (window.fbq) window.fbq('track', 'AddToCart', {
      content_ids: [product._id],
      content_name: product.name,
      content_type: 'product',
      value: cheapestPkg?.price ?? product.price,
      currency: 'INR',
    })
  }

  const handleToggleWishlist = (e) => {
    e.preventDefault()
    toggleWishlist(product._id)
  }

  return (
    <Link to={`/shop/${product.slug}`} className="card group flex flex-col h-full">
      {/* Image */}
      <div className="relative overflow-hidden rounded-t-2xl aspect-square bg-forest-50">
        <img
          src={cldOptimize(product.images?.[0]?.url, 500) || '/logo.png'}
          alt={product.images?.[0]?.alt || product.name}
          loading="lazy"
          onError={e => { e.target.onerror = null; e.target.src = '/logo.png' }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Badges overlay */}
        <div className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3 flex flex-col gap-1 sm:gap-2">
          {product.isComingSoon && (
            <span className="bg-forest-700 text-white text-[8px] sm:text-xs font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full whitespace-nowrap">COMING SOON</span>
          )}
          {product.isBestseller && (
            <span className="bg-forest-900 text-forest-300 text-[8px] sm:text-xs font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full whitespace-nowrap">BESTSELLER</span>
          )}
          {discount > 0 && (
            <span className="bg-red-500 text-white text-[8px] sm:text-xs font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full whitespace-nowrap">{discount}% OFF</span>
          )}
        </div>
        {/* Wishlist */}
        <button
          onClick={handleToggleWishlist}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-1.5 right-1.5 sm:top-3 sm:right-3 w-6 h-6 sm:w-8 sm:h-8 bg-white/80 rounded-full flex items-center justify-center transition-opacity hover:text-red-500 ${
            wishlisted ? 'opacity-100 text-red-500' : 'opacity-0 group-hover:opacity-100 text-forest-700'
          }`}
        >
          <Heart className="w-3 h-3 sm:w-4 sm:h-4" fill={wishlisted ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex-1">
          {product.concerns?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {product.concerns.map(concern => (
                <span key={concern} className="badge-green text-xs">{concern}</span>
              ))}
            </div>
          )}
          <h3 className="font-semibold text-forest-900 text-sm mb-1 leading-snug line-clamp-2">{product.name}</h3>
          <p className="text-forest-500 text-xs mb-3 line-clamp-1">{product.tagline}</p>

          {/* Ratings */}
          {product.ratings?.count > 0 && (
            <div className="flex items-center gap-1 mb-3">
              <div className="flex text-gold-accent">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={12} fill={i < Math.round(product.ratings.average) ? 'currentColor' : 'none'} />
                ))}
              </div>
              <span className="text-xs text-forest-500">({product.ratings.count})</span>
            </div>
          )}
        </div>

        {/* Price + Add to cart */}
        <div className="flex items-center justify-between mt-auto pt-2">
          <div>
            {cheapestPkg ? (
              <>
                <p className="text-xs text-forest-400">Starting From</p>
                <span className="text-lg font-bold text-forest-900">₹{cheapestPkg.price}</span>
                {cheapestPkg.comparePrice > cheapestPkg.price && (
                  <span className="text-xs text-forest-400 line-through ml-2">₹{cheapestPkg.comparePrice}</span>
                )}
              </>
            ) : (
              <>
                <span className="text-lg font-bold text-forest-900">₹{product.price}</span>
                {product.comparePrice && (
                  <span className="text-xs text-forest-400 line-through ml-2">₹{product.comparePrice}</span>
                )}
              </>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={product.isComingSoon}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white flex-shrink-0 hover:scale-110 transition-transform disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{ background: 'linear-gradient(135deg,#4F29A3,#3D1868)' }}
          >
            <ShoppingCart size={16} />
          </button>
        </div>

        {/* Certifications */}
        {product.certifications?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-forest-100">
            {product.certifications.slice(0, 3).map(cert => (
              <span key={cert} className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{cert}</span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
