import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  ShoppingCart, User, Search, Menu, X, Phone, Heart, LayoutDashboard, Leaf, Truck, Star, ChevronDown, ChevronRight,
  Gift, Percent, Sparkles, Tag, ShieldCheck, Clock, BadgePercent,
} from 'lucide-react'
import useCartStore from '../../store/cartStore'
import useAuthStore from '../../store/authStore'
import api from '../../api'
import { cldOptimize } from '../../utils/cloudinary'

const ANNOUNCEMENT_ICONS = {
  Leaf, Truck, Star, Gift, Percent, Sparkles, Heart, Tag, ShieldCheck, Clock, Phone, BadgePercent,
}

const isExternalUrl = (url) => /^https?:\/\//i.test(url || '')

// Category cards/menu entries respect an optional admin-set custom `link`,
// falling back to the default /shop?category=slug destination.
function CategoryLink({ category, onClick, className, children }) {
  const target = category.link || `/shop?category=${category.slug}`
  if (isExternalUrl(target)) {
    return (
      <a href={target} target="_blank" rel="noopener noreferrer" onClick={onClick} className={className}>
        {children}
      </a>
    )
  }
  return (
    <Link to={target} onClick={onClick} className={className}>
      {children}
    </Link>
  )
}

// External / tel / mailto links use a plain <a>; internal routes (starting with "/") use <Link>.
function AnnouncementItem({ text, link, icon, fill }) {
  const Icon = ANNOUNCEMENT_ICONS[icon] || Sparkles
  const content = (
    <span className="flex items-center gap-1.5 font-medium tracking-wide">
      <Icon size={13} className={`text-gold-accent flex-shrink-0 ${fill ? 'fill-gold-accent' : ''}`} />
      {text}
    </span>
  )
  if (!link) return content
  if (/^(https?:|tel:|mailto:)/.test(link)) {
    return (
      <a href={link} target={link.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="hover:text-gold-accent transition-colors">
        {content}
      </a>
    )
  }
  return (
    <Link to={link} className="hover:text-gold-accent transition-colors">
      {content}
    </Link>
  )
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const [shopMenuOpen, setShopMenuOpen] = useState(false)
  const [mobileShopOpen, setMobileShopOpen] = useState(false)
  const [categories, setCategories] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [suggestLoading, setSuggestLoading] = useState(false)
  const [announcements, setAnnouncements] = useState([])
  const cartCount = useCartStore(s => s.items.reduce((a, i) => a + i.qty, 0))
  const user = useAuthStore(s => s.user)
  const wishlistCount = user?.wishlist?.length || 0
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/categories')
      .then(({ data }) => setCategories(data.categories || []))
      .catch(() => setCategories([]))
  }, [])

  useEffect(() => {
    api.get('/announcements/active')
      .then(({ data }) => setAnnouncements(data.announcements || []))
      .catch(() => setAnnouncements([]))
  }, [])

  const topLevelCategories = categories.filter(c => !c.parentSlug)
  const childrenOf = (slug) => categories.filter(c => c.parentSlug === slug)

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)
    setSearchOpen(false)
    setSearchQuery('')
    setSuggestions([])
  }

  const closeSearch = () => {
    setSearchOpen(false)
    setSearchQuery('')
    setSuggestions([])
  }

  const goToSuggestion = (product) => {
    navigate(`/shop/${product.slug}`)
    setSearchOpen(false)
    setSearchQuery('')
    setSuggestions([])
  }

  // As-you-type product suggestions, debounced to avoid a request per keystroke.
  useEffect(() => {
    const q = searchQuery.trim()
    if (q.length < 2) { setSuggestions([]); return }
    setSuggestLoading(true)
    const timer = setTimeout(() => {
      api.get(`/products?search=${encodeURIComponent(q)}&limit=6`)
        .then(({ data }) => setSuggestions(data.products || []))
        .catch(() => setSuggestions([]))
        .finally(() => setSuggestLoading(false))
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navLinks = [
    { to: '/',       label: 'Home' },
    { to: '/shop',   label: 'Shop' },
    { to: '/about',  label: 'About' },
    { to: '/blog',   label: 'Blog' },
    { to: '/contact',label: 'Contact' },
  ]

  return (
    <>
      {/* Announcement bar — admin-managed, always-scrolling marquee */}
      <div className="bg-gradient-to-r from-forest-800 via-forest-900 to-forest-800 text-cream-50 text-xs">
        <div className="max-w-7xl mx-auto flex items-center gap-4 px-4 sm:px-6 py-2.5">
          <a href="tel:+919218171625" className="flex items-center gap-1.5 font-medium tracking-wide text-cream-100 hover:text-gold-accent transition-colors duration-200 flex-shrink-0">
            <Phone size={13} />
            <span className="hidden sm:inline">+91 92181 71625</span>
          </a>

          {announcements.length > 0 && (
            <div className="flex-1 min-w-0 overflow-hidden">
              <div className="flex w-max animate-marquee whitespace-nowrap hover:[animation-play-state:paused] text-cream-100">
                {[0, 1].map(rep => (
                  <div key={rep} className="flex items-center gap-8 pr-8 flex-shrink-0">
                    {announcements.map((a, i) => (
                      <AnnouncementItem key={`${a._id ?? i}-${rep}`} text={a.text} link={a.link} icon={a.icon} />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main navbar */}
      <nav className={`sticky top-0 z-50 bg-cream-50/95 backdrop-blur-md transition-shadow duration-300 ${scrolled ? 'shadow-card border-b border-forest-200/70' : 'border-b border-forest-100'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-20 gap-3 sm:gap-6">

          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0 group">
            <img src={cldOptimize('https://res.cloudinary.com/eob3oguc/image/upload/v1793086126/clevercat/branding/logo.png', 200)} alt="Clever Cat" fetchpriority="high" className="h-20 w-20 sm:h-24 sm:w-24 object-contain transition-transform duration-300 group-hover:scale-105" />
          </Link>

          {/* Desktop nav links — centered */}
          <div className="hidden lg:flex items-center justify-center flex-1 gap-9">
            {navLinks.map(link => (
              link.to === '/shop' ? (
                <div key={link.to} className="relative" onMouseEnter={() => setShopMenuOpen(true)} onMouseLeave={() => setShopMenuOpen(false)}>
                  <NavLink
                    to={link.to}
                    className={({ isActive }) =>
                      `relative py-2 flex items-center gap-1 text-[13px] font-semibold uppercase tracking-[0.12em] transition-colors duration-200 after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:h-[2px] after:rounded-full after:bg-gold-gradient after:transition-all after:duration-300 ${
                        isActive
                          ? 'text-forest-800 after:w-full'
                          : 'text-forest-900 hover:text-forest-800 after:w-0 hover:after:w-full'
                      }`
                    }
                  >
                    {link.label} <ChevronDown size={13} className={`transition-transform duration-200 ${shopMenuOpen ? 'rotate-180' : ''}`} />
                  </NavLink>

                  {/* Dropdown — plain, left-aligned list; not a mega-menu */}
                  {shopMenuOpen && topLevelCategories.length > 0 && (
                    <div className="absolute top-full left-0 pt-2 z-40 animate-fade-in-down">
                      <ul className="bg-white rounded-lg shadow-md border border-forest-100 py-1.5 min-w-[180px]">
                        {topLevelCategories.map(cat => {
                          const children = childrenOf(cat.slug)
                          return (
                            <li key={cat._id}>
                              <CategoryLink category={cat} onClick={() => setShopMenuOpen(false)}
                                className="flex items-center gap-1.5 text-sm font-semibold text-forest-900 hover:text-gold-accent hover:bg-forest-50 px-4 py-2">
                                {cat.name}
                              </CategoryLink>
                              {children.length > 0 && (
                                <ul>
                                  {children.map(child => (
                                    <li key={child._id}>
                                      <CategoryLink category={child} onClick={() => setShopMenuOpen(false)}
                                        className="block text-xs text-forest-600 hover:text-forest-900 hover:bg-forest-50 pl-9 pr-4 py-1.5">
                                        {child.name}
                                      </CategoryLink>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `relative py-2 text-[13px] font-semibold uppercase tracking-[0.12em] transition-colors duration-200 after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:h-[2px] after:rounded-full after:bg-gold-gradient after:transition-all after:duration-300 ${
                      isActive
                        ? 'text-forest-800 after:w-full'
                        : 'text-forest-900 hover:text-forest-800 after:w-0 hover:after:w-full'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              )
            ))}
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-0.5 sm:gap-1.5 flex-shrink-0">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Search"
              className={`p-2.5 rounded-full transition-colors duration-200 ${searchOpen ? 'bg-forest-100 text-forest-800' : 'text-forest-900 hover:text-forest-800 hover:bg-forest-50'}`}
            >
              <Search size={20} />
            </button>

            {/* Wishlist */}
            <Link to={user ? '/profile?tab=wishlist' : '/login'} aria-label="Wishlist" className="hidden sm:block relative p-2.5 rounded-full text-forest-900 hover:text-forest-800 hover:bg-forest-50 transition-colors duration-200">
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-[18px] h-[18px] rounded-full text-white text-[10px] flex items-center justify-center font-bold bg-gold-gradient shadow-gold">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Admin Dashboard link */}
            {user?.role === 'admin' && (
              <Link
                to="/admin/dashboard"
                className="hidden sm:flex items-center gap-1.5 ml-1 px-3.5 py-2 rounded-full text-white text-xs font-semibold bg-gold-gradient shadow-gold hover:shadow-gold-lg transition-shadow duration-300"
              >
                <LayoutDashboard size={14} /> Admin
              </Link>
            )}

            {/* User */}
            <Link
              to={user ? '/profile' : '/login'}
              aria-label="Account"
              className="p-2.5 rounded-full text-forest-900 hover:text-forest-800 hover:bg-forest-50 transition-colors duration-200"
            >
              <User size={20} />
            </Link>

            {/* Cart */}
            <Link to="/cart" aria-label="Cart" className="relative p-2.5 rounded-full text-forest-900 hover:text-forest-800 hover:bg-forest-50 transition-colors duration-200">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-[18px] h-[18px] rounded-full text-white text-[10px] flex items-center justify-center font-bold bg-gold-gradient shadow-gold">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
              className="lg:hidden p-2.5 rounded-full text-forest-900 hover:text-forest-800 hover:bg-forest-50 transition-colors duration-200"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="border-t border-forest-100 px-4 py-4 bg-white animate-fade-in-down">
            <div className="max-w-2xl mx-auto relative">
              <form onSubmit={handleSearchSubmit} className="relative">
                <button type="submit" aria-label="Search" className="absolute left-5 top-1/2 -translate-y-1/2 text-forest-600 hover:text-forest-800">
                  <Search size={18} />
                </button>
                <input
                  autoFocus
                  type="text"
                  placeholder="Search books, puzzles, activity kits..."
                  className="w-full pl-12 pr-12 py-3.5 rounded-full border-2 border-forest-200 bg-cream-50 focus:outline-none focus:ring-4 focus:ring-forest-100 focus:border-forest-800 transition-all duration-200 text-sm placeholder:text-forest-400/70"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                <button type="button" onClick={closeSearch} aria-label="Close search" className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-forest-500 hover:text-forest-800 hover:bg-forest-100 transition-colors">
                  <X size={16} />
                </button>
              </form>

              {/* Live suggestions */}
              {searchQuery.trim().length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-forest-100 overflow-hidden z-10">
                  {suggestLoading ? (
                    <p className="px-5 py-4 text-sm text-forest-400">Searching…</p>
                  ) : suggestions.length > 0 ? (
                    <ul>
                      {suggestions.map(p => (
                        <li key={p._id}>
                          <button type="button" onClick={() => goToSuggestion(p)}
                            className="w-full flex items-center gap-3 px-5 py-3 hover:bg-forest-50 text-left transition-colors">
                            <img src={cldOptimize(p.images?.[0]?.url, 80) || '/logo.png'} alt="" loading="lazy" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                            <span className="flex-1 min-w-0">
                              <span className="block text-sm font-medium text-forest-900 truncate">{p.name}</span>
                              <span className="block text-xs text-forest-500">₹{p.price}</span>
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="px-5 py-4 text-sm text-forest-400">No products found for "{searchQuery}"</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mobile menu */}
        {menuOpen && (
          <div className="lg:hidden border-t border-forest-100 bg-cream-50 px-4 py-4 flex flex-col gap-1 animate-fade-in-down">
            {user?.role === 'admin' && (
              <Link
                to="/admin/dashboard"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 text-base font-semibold py-3 px-3 rounded-xl border-b border-forest-100 text-forest-800 hover:bg-forest-50 transition-colors duration-200"
              >
                <LayoutDashboard size={18} /> Admin Dashboard
              </Link>
            )}
            {navLinks.map(link => (
              link.to === '/shop' ? (
                <div key={link.to} className="border-b border-forest-100">
                  <div className="flex items-center justify-between">
                    <NavLink to={link.to} onClick={() => setMenuOpen(false)}
                      className={({ isActive }) => `flex-1 text-base font-medium py-3 px-3 ${isActive ? 'text-forest-800' : 'text-forest-900'}`}>
                      {link.label}
                    </NavLink>
                    {topLevelCategories.length > 0 && (
                      <button onClick={() => setMobileShopOpen(o => !o)} className="p-3 text-forest-500" aria-label="Toggle categories">
                        <ChevronDown size={16} className={`transition-transform ${mobileShopOpen ? 'rotate-180' : ''}`} />
                      </button>
                    )}
                  </div>
                  {mobileShopOpen && (
                    <div className="pb-3 pl-3 space-y-3">
                      {topLevelCategories.map(cat => (
                        <div key={cat._id}>
                          <CategoryLink category={cat} onClick={() => setMenuOpen(false)}
                            className="text-sm font-semibold text-forest-800 flex items-center gap-1.5">
                            {cat.name}
                          </CategoryLink>
                          {childrenOf(cat.slug).length > 0 && (
                            <ul className="mt-1.5 ml-5 space-y-1.5">
                              {childrenOf(cat.slug).map(child => (
                                <li key={child._id}>
                                  <CategoryLink category={child} onClick={() => setMenuOpen(false)}
                                    className="text-xs text-forest-500 flex items-center gap-1">
                                    <ChevronRight size={10} /> {child.name}
                                  </CategoryLink>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `text-base font-medium py-3 px-3 rounded-xl border-b border-forest-100 last:border-0 transition-colors duration-200 ${
                      isActive ? 'text-forest-800 bg-forest-50' : 'text-forest-900 hover:bg-forest-50'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              )
            ))}
            <Link
              to={user ? '/profile?tab=wishlist' : '/login'}
              onClick={() => setMenuOpen(false)}
              className="sm:hidden flex items-center justify-between gap-2 text-base font-medium py-3 px-3 rounded-xl border-b border-forest-100 text-forest-900 hover:bg-forest-50 transition-colors duration-200"
            >
              <span className="flex items-center gap-2"><Heart size={18} /> Wishlist</span>
              {wishlistCount > 0 && <span className="text-xs font-bold bg-gold-gradient text-white rounded-full px-2 py-0.5">{wishlistCount}</span>}
            </Link>
            <div className="pt-3 flex gap-3">
              <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-outline-gold text-sm flex-1 text-center">Login</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-gold text-sm flex-1 text-center">Register</Link>
            </div>
          </div>
        )}
      </nav>
    </>
  )
}
