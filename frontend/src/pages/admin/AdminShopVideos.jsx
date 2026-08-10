import { useEffect, useRef, useState } from 'react'
import { Plus, Edit2, Trash2, Film, X, Search, Loader2, ToggleLeft, ToggleRight, GripVertical, Eye, Tag, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api'
import MediaInput from '../../components/admin/MediaInput'

const emptyForm = {
  title: '', badge: 'NEW', views: '0', displayOrder: '0', isActive: true,
}

function ProductPicker({ selected, onSelect }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); return }
    setLoading(true)
    const t = setTimeout(() => {
      api.get(`/products?search=${encodeURIComponent(query.trim())}&limit=8`)
        .then(({ data }) => setResults(data.products || []))
        .catch(() => setResults([]))
        .finally(() => setLoading(false))
    }, 350)
    return () => clearTimeout(t)
  }, [query])

  if (selected) {
    return (
      <div className="flex items-center gap-3 border border-forest-200 rounded-xl p-2.5 bg-forest-50">
        <img src={selected.images?.[0]?.url} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-white" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-forest-900 truncate">{selected.name}</p>
          <p className="text-xs text-forest-500">₹{selected.price}</p>
        </div>
        <button type="button" onClick={() => onSelect(null)} className="p-1.5 rounded-lg hover:bg-white text-forest-400 flex-shrink-0" title="Change product">
          <X size={15} />
        </button>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-forest-300" />
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          className="input pl-9"
          placeholder="Search product by name..."
        />
        {loading && <Loader2 size={15} className="animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-forest-300" />}
      </div>
      {open && query.trim().length >= 2 && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-forest-100 rounded-xl shadow-lg max-h-64 overflow-y-auto">
          {results.length === 0 && !loading ? (
            <p className="px-4 py-3 text-sm text-forest-400">No products found</p>
          ) : results.map(p => (
            <button
              type="button"
              key={p._id}
              onClick={() => { onSelect(p); setOpen(false); setQuery('') }}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-forest-50 text-left transition-colors"
            >
              <img src={p.images?.[0]?.url} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0 bg-forest-50" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-forest-900 truncate">{p.name}</p>
                <p className="text-xs text-forest-500">₹{p.price}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ShopVideoModal({ video, onClose, onSaved }) {
  const isEdit = !!video
  const [form, setForm] = useState(() => video ? {
    title: video.title || '',
    badge: video.badge || 'NEW',
    views: String(video.views ?? 0),
    displayOrder: String(video.displayOrder ?? 0),
    isActive: video.isActive !== false,
  } : emptyForm)
  const [product, setProduct] = useState(video?.product || null)
  const [videoUrl, setVideoUrl] = useState(video?.videoUrl || '')
  const [saving, setSaving] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!videoUrl) return toast.error('A video file is required')
    if (!product) return toast.error('Please tag a product')
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('title', form.title.trim())
      formData.append('badge', form.badge.trim() || 'NEW')
      formData.append('views', form.views || 0)
      formData.append('product', product._id)
      formData.append('displayOrder', form.displayOrder || 0)
      formData.append('isActive', form.isActive ? 'true' : 'false')
      formData.append('video', videoUrl)

      if (isEdit) {
        await api.put(`/shop-videos/${video._id}`, formData)
        toast.success('Video updated')
      } else {
        await api.post('/shop-videos', formData)
        toast.success('Video created')
      }
      onSaved()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-forest-100 px-5 py-4 flex items-center justify-between z-10">
          <h2 className="font-bold text-forest-900 font-serif text-lg">{isEdit ? 'Edit Video' : 'Add Video'}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-forest-50 text-forest-400"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">

          <div>
            <label className="block text-xs text-forest-500 mb-1.5">Video File {!isEdit && '*'} <span className="text-forest-400">(portrait/9:16 works best)</span></label>
            <MediaInput
              value={videoUrl}
              onChange={setVideoUrl}
              accept="video"
              layout="stack"
              previewClassName="w-full aspect-[9/16] max-h-64 mx-auto rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs text-forest-500 mb-1.5 flex items-center gap-1.5"><Tag size={13} /> Tagged Product *</label>
            <ProductPicker selected={product} onSelect={setProduct} />
            <p className="text-xs text-forest-400 mt-1">Clicking the video on the storefront takes shoppers straight to this product.</p>
          </div>

          <div>
            <label className="block text-xs text-forest-500 mb-1.5">Caption <span className="text-forest-400">(optional — falls back to product name)</span></label>
            <input name="title" value={form.title} onChange={handleChange} className="input" placeholder="1001 Awesome Stickers – Foods" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-forest-500 mb-1.5">Badge</label>
              <input name="badge" value={form.badge} onChange={handleChange} className="input" placeholder="NEW" />
            </div>
            <div>
              <label className="block text-xs text-forest-500 mb-1.5 flex items-center gap-1"><Eye size={12} /> Views</label>
              <input name="views" type="number" min="0" value={form.views} onChange={handleChange} className="input" />
            </div>
            <div>
              <label className="block text-xs text-forest-500 mb-1.5">Display Order</label>
              <input name="displayOrder" type="number" value={form.displayOrder} onChange={handleChange} className="input" />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} className="w-4 h-4 accent-forest-800" />
            <span className="text-sm text-forest-800 font-medium">Active (visible on homepage)</span>
          </label>

          <button type="submit" disabled={saving} className="btn-gold w-full justify-center text-sm">
            {saving ? <Loader2 size={16} className="animate-spin" /> : null} {isEdit ? 'Update Video' : 'Create Video'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function AdminShopVideos() {
  const [videos, setVideos] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalState, setModalState] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const dragItem = useRef(null)
  const dragOverItem = useRef(null)

  const [heading, setHeading] = useState("Parent's Choice")
  const [savingHeading, setSavingHeading] = useState(false)

  const load = () => {
    setLoading(true)
    api.get('/shop-videos')
      .then(({ data }) => setVideos(data.videos || []))
      .catch(() => toast.error('Failed to load videos'))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  useEffect(() => {
    api.get('/settings')
      .then(({ data }) => { if (data.settings?.shopVideoHeading) setHeading(data.settings.shopVideoHeading) })
      .catch(() => {})
  }, [])

  const handleSaveHeading = async (e) => {
    e.preventDefault()
    setSavingHeading(true)
    try {
      const { data } = await api.put('/settings/shop-video-heading', { shopVideoHeading: heading })
      setHeading(data.settings.shopVideoHeading)
      toast.success('Heading updated')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update heading')
    } finally {
      setSavingHeading(false)
    }
  }

  const filtered = videos.filter(v =>
    (v.title || v.product?.name || '').toLowerCase().includes(search.toLowerCase())
  )
  const reorderable = !search

  const toggleActive = async (v) => {
    try {
      const formData = new FormData()
      formData.append('isActive', (!v.isActive).toString())
      await api.put(`/shop-videos/${v._id}`, formData)
      setVideos(prev => prev.map(x => x._id === v._id ? { ...x, isActive: !v.isActive } : x))
    } catch {
      toast.error('Failed to update status')
    }
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/shop-videos/${deleteTarget._id}`)
      setVideos(prev => prev.filter(v => v._id !== deleteTarget._id))
      toast.success('Video deleted')
    } catch {
      toast.error('Failed to delete video')
    } finally {
      setDeleteTarget(null)
    }
  }

  const handleDragStart = (index) => { dragItem.current = index }
  const handleDragEnter = (index) => { dragOverItem.current = index }

  const handleDragEnd = async () => {
    const from = dragItem.current
    const to = dragOverItem.current
    dragItem.current = null
    dragOverItem.current = null
    if (from === null || to === null || from === to || !reorderable) return

    const reordered = [...videos]
    const [moved] = reordered.splice(from, 1)
    reordered.splice(to, 0, moved)
    const withOrder = reordered.map((v, i) => ({ ...v, displayOrder: i }))
    setVideos(withOrder)

    try {
      await api.put('/shop-videos/reorder', {
        order: withOrder.map(v => ({ _id: v._id, displayOrder: v.displayOrder })),
      })
    } catch {
      toast.error('Failed to save new order')
      load()
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-forest-900 font-serif">Shop by Video</h1>
          <p className="text-sm text-forest-500 mt-0.5">{videos.length} total videos · drag rows to reorder</p>
        </div>
        <button onClick={() => setModalState({})} className="btn-gold text-sm">
          <Plus size={16} /> Add Video
        </button>
      </div>

      <div className="card p-4 text-sm text-forest-600 bg-forest-50/50 border border-forest-100">
        Videos marked <span className="font-semibold">Active</span> appear in the "{heading}" carousel on the homepage. Each video is tagged to a product — tapping it opens a larger view with a "View Product" button linking straight to that product's page.
      </div>

      <form onSubmit={handleSaveHeading} className="card p-4 flex flex-col sm:flex-row sm:items-end gap-3">
        <div className="flex-1">
          <label className="block text-xs text-forest-500 mb-1.5">Carousel Heading</label>
          <input value={heading} onChange={e => setHeading(e.target.value)} className="input" placeholder="Parent's Choice" />
        </div>
        <button type="submit" disabled={savingHeading} className="btn-gold text-sm">
          {savingHeading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Heading
        </button>
      </form>

      <div className="relative max-w-xs">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-forest-300" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          className="input pl-9" placeholder="Search videos..." />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-forest-100">
                {['', 'Preview', 'Caption', 'Product', 'Views', 'Status', 'Order', ''].map((h, i) => (
                  <th key={i} className="text-left px-4 py-3 text-xs font-semibold text-forest-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-b border-forest-50">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-forest-100 rounded animate-pulse" style={{ width: `${50 + j * 4}%` }} /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-forest-400">
                    <Film size={28} className="mx-auto mb-2 opacity-50" />
                    No videos found. Click "Add Video" to create your first shoppable video.
                  </td>
                </tr>
              ) : filtered.map((v, index) => (
                <tr
                  key={v._id}
                  draggable={reorderable}
                  onDragStart={() => handleDragStart(index)}
                  onDragEnter={() => handleDragEnter(index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={e => e.preventDefault()}
                  className={`border-b border-forest-50 hover:bg-forest-50/50 transition-colors ${reorderable ? 'cursor-move' : ''}`}
                >
                  <td className="px-2 py-3 text-forest-300"><GripVertical size={16} /></td>
                  <td className="px-4 py-3">
                    <div className="w-12 h-16 rounded-lg bg-forest-900 border border-forest-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                      <img src={v.thumbnailUrl} alt="" className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none' }} />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-forest-900">{v.title || <span className="text-forest-400 italic">Untitled</span>}</p>
                    <span className="text-[10px] font-semibold bg-forest-100 text-forest-700 px-2 py-0.5 rounded-full">{v.badge}</span>
                  </td>
                  <td className="px-4 py-3">
                    {v.product ? (
                      <div className="flex items-center gap-2">
                        <img src={v.product.images?.[0]?.url} alt="" className="w-8 h-8 rounded-lg object-cover bg-forest-50" />
                        <span className="text-forest-700 truncate max-w-[140px]">{v.product.name}</span>
                      </div>
                    ) : <span className="text-red-400 text-xs">No product tagged</span>}
                  </td>
                  <td className="px-4 py-3 text-forest-600">{v.views}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(v)} className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full transition-colors ${v.isActive ? 'badge-green' : 'bg-gray-200 text-gray-700'}`}>
                      {v.isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                      {v.isActive ? 'Active' : 'Hidden'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-forest-600">{v.displayOrder}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setModalState(v)} className="p-1.5 rounded-lg hover:bg-forest-100 text-forest-400 hover:text-forest-900 transition-colors" title="Edit">
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => setDeleteTarget(v)} className="p-1.5 rounded-lg hover:bg-red-100 text-forest-400 hover:text-red-500 transition-colors" title="Delete">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalState !== null && (
        <ShopVideoModal
          video={modalState._id ? modalState : null}
          onClose={() => setModalState(null)}
          onSaved={() => { setModalState(null); load() }}
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <Trash2 size={32} className="mx-auto text-red-500 mb-3" />
            <h2 className="font-bold text-forest-900 font-serif text-lg mb-1">Delete video?</h2>
            <p className="text-sm text-forest-500 mb-5">
              <span className="font-semibold">{deleteTarget.title || 'This video'}</span> will be permanently removed from the homepage.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="btn-outline-gold flex-1 justify-center text-sm">Cancel</button>
              <button onClick={handleDelete} className="flex-1 justify-center text-sm bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl py-2.5 flex items-center gap-2">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
