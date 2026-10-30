import { useState, useMemo, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { SlidersHorizontal, X, ChevronDown, Search } from 'lucide-react'
import ProductCard from '../components/ui/ProductCard'
import api from '../api'

const isExternalUrl = (url) => /^https?:\/\//i.test(url || '')

// Age groups are loaded from the API (same active age-group cards as homepage)
const SORTS    = [
  { label: 'Popularity',      value: 'popular' },
  { label: 'Newest',          value: 'newest' },
  { label: 'Price: Low–High', value: 'price_asc' },
  { label: 'Price: High–Low', value: 'price_desc' },
  { label: 'Top Rated',       value: 'rating' },
]

// Hoisted out of ShopPage — defining this inline in the render body created a
// brand-new component type on every render, so React remounted the whole
// panel (and dropped focus from the search input) on every keystroke.
function FilterPanel({ search, setSearch, categories, category, setCategory, ageGroups, ageGroup, setAgeGroup, priceRanges, minPrice, maxPrice, setPriceRange, hasFilters, resetFilters }) {
  return (
    <div className="space-y-6">
      <div className="relative">
        <input type="text" placeholder="Search products..." className="input pr-10 text-sm"
          value={search} onChange={e => setSearch(e.target.value)} />
        <Search size={16} className="absolute right-3 top-3.5 text-forest-600" />
      </div>
      <div>
        <p className="text-forest-800 font-semibold text-sm mb-3">Category</p>
        <div className="space-y-1">
          {['All', ...categories.map(c => c.slug)].map((slug, i) => {
            const cat = categories.find(c => c.slug === slug)
            const className = `w-full text-left text-sm px-3 py-2 rounded-xl transition-colors flex items-center gap-2 ${category === slug ? 'bg-forest-100 text-forest-900 font-semibold' : 'text-forest-700 hover:bg-forest-100'}`
            const label = i === 0 ? 'All' : cat?.name
            // A category with an admin-set custom link redirects there instead of filtering in-page
            if (cat?.link) {
              return isExternalUrl(cat.link) ? (
                <a key={slug} href={cat.link} target="_blank" rel="noopener noreferrer" className={className}>{label}</a>
              ) : (
                <Link key={slug} to={cat.link} className={className}>{label}</Link>
              )
            }
            return (
              <button key={slug} onClick={() => setCategory(slug)} className={className}>
                {label}
              </button>
            )
          })}
        </div>
      </div>
      <div>
        <p className="text-forest-800 font-semibold text-sm mb-3">Age Group</p>
        <div className="space-y-1">
          {['All', ...ageGroups.map(c => c.label)].map(c => (
            <button key={c} onClick={() => setAgeGroup(c)}
              className={`w-full text-left text-sm px-3 py-2 rounded-xl transition-colors ${ageGroup === c ? 'bg-forest-100 text-forest-900 font-semibold' : 'text-forest-700 hover:bg-forest-100'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-forest-800 font-semibold text-sm mb-3">Price</p>
        <div className="space-y-1">
          <button onClick={() => setPriceRange(0, 999)}
            className={`w-full text-left text-sm px-3 py-2 rounded-xl transition-colors ${minPrice === 0 && maxPrice === 999 ? 'bg-forest-100 text-forest-900 font-semibold' : 'text-forest-700 hover:bg-forest-100'}`}>
            All
          </button>
          {priceRanges.map(p => (
            <button key={p._id} onClick={() => setPriceRange(p.minPrice || 0, p.maxPrice)}
              className={`w-full text-left text-sm px-3 py-2 rounded-xl transition-colors ${minPrice === (p.minPrice || 0) && maxPrice === p.maxPrice ? 'bg-forest-100 text-forest-900 font-semibold' : 'text-forest-700 hover:bg-forest-100'}`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>
      {hasFilters && (
        <button onClick={resetFilters} className="w-full btn-outline-gold text-sm py-2">Reset Filters</button>
      )}
    </div>
  )
}

export default function ShopPage() {
  const [searchParams] = useSearchParams()
  const [mobileFilter, setMobileFilter] = useState(false)
  const [search, setSearch]     = useState(searchParams.get('search') || '')
  const [sort, setSort]         = useState(searchParams.get('sort') || 'popular')
  const [category, setCategory] = useState(searchParams.get('category') || 'All')
  const [ageGroup, setAgeGroup] = useState(searchParams.get('ageGroup') || 'All')
  const [minPrice, setMinPrice] = useState(Number(searchParams.get('minPrice')) || 0)
  const [maxPrice, setMaxPrice] = useState(Number(searchParams.get('maxPrice')) || 999)
  const [bestsellerOnly, setBestsellerOnly] = useState(searchParams.get('bestseller') === 'true')
  const [products, setProducts] = useState([])
  const [ageGroups, setAgeGroups] = useState([])
  const [categories, setCategories] = useState([])
  const [priceRanges, setPriceRanges] = useState([])
  const [loading, setLoading] = useState(true)

  // Re-sync from the URL when a filter link (category, age group, search,
  // sort, price) is clicked again while already on /shop — React Router
  // doesn't remount this component just because the query string changed,
  // so the initial useState above only fires once and would otherwise
  // ignore later navbar/homepage clicks.
  useEffect(() => {
    setCategory(searchParams.get('category') || 'All')
  }, [searchParams.get('category')])
  useEffect(() => {
    setAgeGroup(searchParams.get('ageGroup') || 'All')
  }, [searchParams.get('ageGroup')])
  useEffect(() => {
    setSearch(searchParams.get('search') || '')
  }, [searchParams.get('search')])
  useEffect(() => {
    setSort(searchParams.get('sort') || 'popular')
  }, [searchParams.get('sort')])
  useEffect(() => {
    setMinPrice(Number(searchParams.get('minPrice')) || 0)
  }, [searchParams.get('minPrice')])
  useEffect(() => {
    setMaxPrice(Number(searchParams.get('maxPrice')) || 999)
  }, [searchParams.get('maxPrice')])
  useEffect(() => {
    setBestsellerOnly(searchParams.get('bestseller') === 'true')
  }, [searchParams.get('bestseller')])

  useEffect(() => {
    setLoading(true)
    api.get('/products?limit=200')
      .then(({ data }) => setProducts(data.products || []))
      .catch(() => setProducts([]))
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

  const filtered = useMemo(() => {
    let list = products.filter(p => p.isActive)
    if (search) {
      const q = search.trim().toLowerCase()
      list = list.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.tagline?.toLowerCase().includes(q) ||
        p.author?.toLowerCase().includes(q) ||
        p.tags?.some(t => t.toLowerCase().includes(q)) ||
        p.categories?.some(c => c.toLowerCase().includes(q))
      )
    }
    if (category !== 'All')  list = list.filter(p => p.categories?.includes(category))
    if (ageGroup !== 'All')  list = list.filter(p => p.ageGroups?.includes(ageGroup))
    if (bestsellerOnly)      list = list.filter(p => p.isBestseller)
    list = list.filter(p => p.price >= minPrice && p.price <= maxPrice)
    if (sort === 'newest')     return [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    if (sort === 'price_asc')  return [...list].sort((a, b) => a.price - b.price)
    if (sort === 'price_desc') return [...list].sort((a, b) => b.price - a.price)
    if (sort === 'rating')     return [...list].sort((a, b) => b.ratings.average - a.ratings.average)
    return [...list].sort((a, b) => (b.sold || 0) - (a.sold || 0)) // Popularity — best-selling first
  }, [products, search, category, ageGroup, bestsellerOnly, minPrice, maxPrice, sort])

  const setPriceRange = (min, max) => { setMinPrice(min); setMaxPrice(max) }
  const resetFilters = () => { setCategory('All'); setAgeGroup('All'); setSearch(''); setMinPrice(0); setMaxPrice(999); setBestsellerOnly(false) }
  const hasFilters = category !== 'All' || ageGroup !== 'All' || search || minPrice > 0 || maxPrice < 999 || bestsellerOnly
  const filterPanelProps = { search, setSearch, categories, category, setCategory, ageGroups, ageGroup, setAgeGroup, priceRanges, minPrice, maxPrice, setPriceRange, hasFilters, resetFilters }

  return (
    <div className="min-h-screen">
      <div className="bg-forest-900 py-12 px-4 text-center">
        <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: "'PP Pangram Sans Rounded',sans-serif" }}>Our Products</h1>
        <p className="text-forest-300 text-sm">Books, Puzzles & Learning Products for Every Age</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex gap-8">
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="card p-5 sticky top-24">
              <p className="font-serif text-lg font-bold text-forest-900 mb-5">Filter Products</p>
              <FilterPanel {...filterPanelProps} />
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
              <p className="text-forest-600 text-sm">
                <span className="font-bold text-forest-900">{filtered.length}</span> products found
              </p>
              <div className="flex gap-3 items-center">
                <button onClick={() => setMobileFilter(true)}
                  className="lg:hidden flex items-center gap-2 border border-forest-600 text-forest-900 rounded-full px-4 py-2 text-sm">
                  <SlidersHorizontal size={15} /> Filters
                </button>
                <div className="relative">
                  <select value={sort} onChange={e => setSort(e.target.value)}
                    className="appearance-none border border-forest-200 rounded-xl px-4 py-2 pr-8 text-sm bg-white text-forest-800 focus:outline-none focus:ring-2 focus:ring-forest-300 cursor-pointer">
                    {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-3 text-forest-500 pointer-events-none" />
                </div>
              </div>
            </div>

            {hasFilters && (
              <div className="flex flex-wrap gap-2 mb-5">
                {category !== 'All' && <span className="badge-green flex items-center gap-1">{categories.find(c => c.slug === category)?.name || category}<button onClick={() => setCategory('All')}><X size={11} /></button></span>}
                {ageGroup !== 'All' && <span className="badge-gold flex items-center gap-1">{ageGroup}<button onClick={() => setAgeGroup('All')}><X size={11} /></button></span>}
                {bestsellerOnly && <span className="badge-gold flex items-center gap-1">Bestsellers<button onClick={() => setBestsellerOnly(false)}><X size={11} /></button></span>}
                {(minPrice > 0 || maxPrice < 999) && (
                  <span className="badge-gold flex items-center gap-1">
                    {minPrice > 0 ? `₹${minPrice} – ₹${maxPrice}` : `Under ₹${maxPrice}`}
                    <button onClick={() => { setMinPrice(0); setMaxPrice(999) }}><X size={11} /></button>
                  </span>
                )}
              </div>
            )}

            {loading ? (
              <div className="text-center py-24">Loading products…</div>
            ) : filtered.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6">
                {filtered.map(p => <ProductCard key={p._id} product={p} />)}
              </div>
            ) : (
              <div className="text-center py-24">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-semibold text-forest-800 mb-2">No products found</h3>
                <p className="text-forest-500 text-sm mb-5">Try adjusting your filters</p>
                <button onClick={resetFilters} className="btn-gold">Show All Products</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {mobileFilter && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileFilter(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-forest-50 p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <p className="font-serif text-lg font-bold text-forest-900">Filters</p>
              <button onClick={() => setMobileFilter(false)}><X size={20} className="text-forest-600" /></button>
            </div>
            <FilterPanel {...filterPanelProps} />
          </div>
        </div>
      )}
    </div>
  )
}
