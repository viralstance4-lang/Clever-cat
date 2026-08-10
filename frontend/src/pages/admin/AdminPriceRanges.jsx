import { useEffect, useRef, useState } from 'react'
import { Plus, Edit2, Trash2, Tag, X, Search, Loader2, ToggleLeft, ToggleRight, GripVertical } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api'

const emptyForm = { label: '', maxPrice: '', displayOrder: '0', isActive: true }

function PriceRangeModal({ priceRange, onClose, onSaved }) {
  const isEdit = !!priceRange
  const [form, setForm] = useState(() => priceRange ? {
    label: priceRange.label || '',
    maxPrice: String(priceRange.maxPrice ?? ''),
    displayOrder: String(priceRange.displayOrder ?? 0),
    isActive: priceRange.isActive !== false,
  } : emptyForm)
  const [saving, setSaving] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.label.trim()) return toast.error('Label is required')
    if (!(Number(form.maxPrice) > 0)) return toast.error('Max price must be greater than 0')
    setSaving(true)
    try {
      const payload = {
        label: form.label.trim(),
        maxPrice: Number(form.maxPrice),
        displayOrder: Number(form.displayOrder) || 0,
        isActive: form.isActive,
      }
      if (isEdit) {
        await api.put(`/price-ranges/${priceRange._id}`, payload)
        toast.success('Price range updated')
      } else {
        await api.post('/price-ranges', payload)
        toast.success('Price range created')
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
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-forest-100 px-5 py-4 flex items-center justify-between z-10">
          <h2 className="font-bold text-forest-900 font-serif text-lg">{isEdit ? 'Edit Price Range' : 'Add Price Range'}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-forest-50 text-forest-400"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs text-forest-500 mb-1.5">Label *</label>
            <input name="label" value={form.label} onChange={handleChange} className="input" placeholder="Under ₹199" required />
          </div>

          <div>
            <label className="block text-xs text-forest-500 mb-1.5">Max Price (₹) *</label>
            <input name="maxPrice" type="number" min="1" value={form.maxPrice} onChange={handleChange} className="input" placeholder="199" required />
            <p className="text-xs text-forest-400 mt-1">Clicking this button on the homepage filters the shop to products priced ₹{form.maxPrice || 'X'} or below.</p>
          </div>

          <div>
            <label className="block text-xs text-forest-500 mb-1.5">Display Order</label>
            <input name="displayOrder" type="number" value={form.displayOrder} onChange={handleChange} className="input" />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} className="w-4 h-4 accent-forest-800" />
            <span className="text-sm text-forest-800 font-medium">Active (visible on homepage)</span>
          </label>

          <button type="submit" disabled={saving} className="btn-gold w-full justify-center text-sm">
            {saving ? <Loader2 size={16} className="animate-spin" /> : null} {isEdit ? 'Update Price Range' : 'Create Price Range'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function AdminPriceRanges() {
  const [priceRanges, setPriceRanges] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalState, setModalState] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const dragItem = useRef(null)
  const dragOverItem = useRef(null)

  const load = () => {
    setLoading(true)
    api.get('/price-ranges')
      .then(({ data }) => setPriceRanges(data.priceRanges || []))
      .catch(() => toast.error('Failed to load price ranges'))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const filtered = priceRanges.filter(p => p.label.toLowerCase().includes(search.toLowerCase()))
  const reorderable = !search

  const toggleActive = async (p) => {
    try {
      await api.put(`/price-ranges/${p._id}`, { isActive: !p.isActive })
      setPriceRanges(prev => prev.map(x => x._id === p._id ? { ...x, isActive: !p.isActive } : x))
    } catch {
      toast.error('Failed to update status')
    }
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/price-ranges/${deleteTarget._id}`)
      setPriceRanges(prev => prev.filter(p => p._id !== deleteTarget._id))
      toast.success('Price range deleted')
    } catch {
      toast.error('Failed to delete price range')
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

    const reordered = [...priceRanges]
    const [moved] = reordered.splice(from, 1)
    reordered.splice(to, 0, moved)
    const withOrder = reordered.map((p, i) => ({ ...p, displayOrder: i }))
    setPriceRanges(withOrder)

    try {
      await api.put('/price-ranges/reorder', {
        order: withOrder.map(p => ({ _id: p._id, displayOrder: p.displayOrder })),
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
          <h1 className="text-2xl font-bold text-forest-900 font-serif">Shop by Price</h1>
          <p className="text-sm text-forest-500 mt-0.5">{priceRanges.length} total price ranges · drag rows to reorder</p>
        </div>
        <button onClick={() => setModalState({})} className="btn-gold text-sm">
          <Plus size={16} /> Add Price Range
        </button>
      </div>

      <div className="card p-4 text-sm text-forest-600 bg-forest-50/50 border border-forest-100">
        Price ranges marked <span className="font-semibold">Active</span> appear as pill buttons below "Shop by Age" on the homepage, sorted by Display Order. Each button links to the shop page pre-filtered to products priced at or below its Max Price.
      </div>

      <div className="relative max-w-xs">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-forest-300" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          className="input pl-9" placeholder="Search price ranges..." />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-forest-100">
                {['', 'Label', 'Max Price', 'Status', 'Order', ''].map((h, i) => (
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
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-forest-100 rounded animate-pulse" style={{ width: `${50 + j * 4}%` }} /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-forest-400">
                    <Tag size={28} className="mx-auto mb-2 opacity-50" />
                    No price ranges found. Click "Add Price Range" to create your first one.
                  </td>
                </tr>
              ) : filtered.map((p, index) => (
                <tr
                  key={p._id}
                  draggable={reorderable}
                  onDragStart={() => handleDragStart(index)}
                  onDragEnter={() => handleDragEnter(index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={e => e.preventDefault()}
                  className={`border-b border-forest-50 hover:bg-forest-50/50 transition-colors ${reorderable ? 'cursor-move' : ''}`}
                >
                  <td className="px-2 py-3 text-forest-300"><GripVertical size={16} /></td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-forest-900">{p.label || <span className="text-forest-400 italic">Untitled</span>}</p>
                  </td>
                  <td className="px-4 py-3 text-forest-600">₹{p.maxPrice}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(p)} className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full transition-colors ${p.isActive ? 'badge-green' : 'bg-gray-200 text-gray-700'}`}>
                      {p.isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                      {p.isActive ? 'Active' : 'Hidden'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-forest-600">{p.displayOrder}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setModalState(p)} className="p-1.5 rounded-lg hover:bg-forest-100 text-forest-400 hover:text-forest-900 transition-colors" title="Edit">
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => setDeleteTarget(p)} className="p-1.5 rounded-lg hover:bg-red-100 text-forest-400 hover:text-red-500 transition-colors" title="Delete">
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
        <PriceRangeModal
          priceRange={modalState._id ? modalState : null}
          onClose={() => setModalState(null)}
          onSaved={() => { setModalState(null); load() }}
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <Trash2 size={32} className="mx-auto text-red-500 mb-3" />
            <h2 className="font-bold text-forest-900 font-serif text-lg mb-1">Delete price range?</h2>
            <p className="text-sm text-forest-500 mb-5">
              <span className="font-semibold">{deleteTarget.label}</span> will be permanently removed from the homepage.
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
