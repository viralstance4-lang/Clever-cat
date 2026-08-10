import { useEffect, useRef, useState } from 'react'
import { Plus, Edit2, Trash2, Quote, X, Search, Loader2, ToggleLeft, ToggleRight, GripVertical, Star, Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api'
import MediaInput from '../../components/admin/MediaInput'

const emptyForm = {
  name: '', city: '', rating: 5, text: '', displayOrder: '0', isActive: true,
}

function StarPicker({ value, onChange }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button" onClick={() => onChange(n)} className="text-gold-accent">
          <Star size={22} fill={n <= value ? 'currentColor' : 'none'} />
        </button>
      ))}
    </div>
  )
}

function TestimonialModal({ testimonial, onClose, onSaved }) {
  const isEdit = !!testimonial
  const [form, setForm] = useState(() => testimonial ? {
    name: testimonial.name || '',
    city: testimonial.city || '',
    rating: testimonial.rating ?? 5,
    text: testimonial.text || '',
    displayOrder: String(testimonial.displayOrder ?? 0),
    isActive: testimonial.isActive !== false,
  } : emptyForm)
  const [image, setImage] = useState(testimonial?.image || '')
  const [saving, setSaving] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.text.trim()) return toast.error('Name and testimonial text are required')
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('name', form.name.trim())
      formData.append('city', form.city.trim())
      formData.append('rating', form.rating)
      formData.append('text', form.text.trim())
      formData.append('displayOrder', form.displayOrder || 0)
      formData.append('isActive', form.isActive ? 'true' : 'false')
      formData.append('image', image || '')
      if (!image && testimonial?.image) formData.append('removeImage', 'true')

      if (isEdit) {
        await api.put(`/testimonials/${testimonial._id}`, formData)
        toast.success('Testimonial updated')
      } else {
        await api.post('/testimonials', formData)
        toast.success('Testimonial created')
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
          <h2 className="font-bold text-forest-900 font-serif text-lg">{isEdit ? 'Edit Testimonial' : 'Add Testimonial'}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-forest-50 text-forest-400"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs text-forest-500 mb-1.5 flex items-center gap-1.5">
              <ImageIcon size={13} /> Photo <span className="text-forest-400">(optional — falls back to initials avatar)</span>
            </label>
            <MediaInput
              value={image}
              onChange={setImage}
              accept="image"
              layout="inline"
              previewClassName="w-16 h-16 rounded-full"
              onRemove={() => setImage('')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-forest-500 mb-1.5">Parent's Name *</label>
              <input name="name" value={form.name} onChange={handleChange} className="input" placeholder="Ritu Malhotra" required />
            </div>
            <div>
              <label className="block text-xs text-forest-500 mb-1.5">City</label>
              <input name="city" value={form.city} onChange={handleChange} className="input" placeholder="Delhi" />
            </div>
          </div>

          <div>
            <label className="block text-xs text-forest-500 mb-1.5">Testimonial *</label>
            <textarea name="text" value={form.text} onChange={handleChange} className="input min-h-[100px] resize-y" placeholder="My 4-year-old is obsessed with the sticker activity book..." required />
          </div>

          <div>
            <label className="block text-xs text-forest-500 mb-1.5">Rating</label>
            <StarPicker value={form.rating} onChange={n => setForm(f => ({ ...f, rating: n }))} />
          </div>

          <div className="grid grid-cols-2 gap-4 items-end">
            <div>
              <label className="block text-xs text-forest-500 mb-1.5">Display Order</label>
              <input name="displayOrder" type="number" value={form.displayOrder} onChange={handleChange} className="input" />
            </div>
            <label className="flex items-center gap-2 cursor-pointer pb-3">
              <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} className="accent-forest-800 w-4 h-4" />
              <span className="text-sm text-forest-700">Active</span>
            </label>
          </div>

          <button type="submit" disabled={saving} className="btn-gold w-full justify-center text-sm">
            {saving ? <Loader2 size={16} className="animate-spin" /> : null} {isEdit ? 'Update Testimonial' : 'Create Testimonial'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalState, setModalState] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const dragItem = useRef(null)
  const dragOverItem = useRef(null)

  const load = () => {
    setLoading(true)
    api.get('/testimonials')
      .then(({ data }) => setTestimonials(data.testimonials || []))
      .catch(() => toast.error('Failed to load testimonials'))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const filtered = testimonials.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) || t.text.toLowerCase().includes(search.toLowerCase())
  )
  const reorderable = !search

  const toggleActive = async (t) => {
    try {
      await api.put(`/testimonials/${t._id}`, { isActive: !t.isActive })
      setTestimonials(prev => prev.map(x => x._id === t._id ? { ...x, isActive: !t.isActive } : x))
    } catch {
      toast.error('Failed to update status')
    }
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/testimonials/${deleteTarget._id}`)
      setTestimonials(prev => prev.filter(t => t._id !== deleteTarget._id))
      toast.success('Testimonial deleted')
    } catch {
      toast.error('Failed to delete testimonial')
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

    const reordered = [...testimonials]
    const [moved] = reordered.splice(from, 1)
    reordered.splice(to, 0, moved)
    const withOrder = reordered.map((t, i) => ({ ...t, displayOrder: i }))
    setTestimonials(withOrder)

    try {
      await api.put('/testimonials/reorder', {
        order: withOrder.map(t => ({ _id: t._id, displayOrder: t.displayOrder })),
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
          <h1 className="text-2xl font-bold text-forest-900 font-serif">Testimonials</h1>
          <p className="text-sm text-forest-500 mt-0.5">{testimonials.length} total testimonials · drag rows to reorder</p>
        </div>
        <button onClick={() => setModalState({})} className="btn-gold text-sm">
          <Plus size={16} /> Add Testimonial
        </button>
      </div>

      <div className="card p-4 text-sm text-forest-600 bg-forest-50/50 border border-forest-100">
        Testimonials marked <span className="font-semibold">Active</span> appear in the "Loved by Parents Everywhere" carousel on the homepage.
      </div>

      <div className="relative max-w-xs">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-forest-300" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          className="input pl-9" placeholder="Search testimonials..." />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-forest-100">
                {['', 'Name', 'City', 'Rating', 'Testimonial', 'Status', 'Order', ''].map((h, i) => (
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
                    <Quote size={28} className="mx-auto mb-2 opacity-50" />
                    No testimonials found. Click "Add Testimonial" to create your first one.
                  </td>
                </tr>
              ) : filtered.map((t, index) => (
                <tr
                  key={t._id}
                  draggable={reorderable}
                  onDragStart={() => handleDragStart(index)}
                  onDragEnter={() => handleDragEnter(index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={e => e.preventDefault()}
                  className={`border-b border-forest-50 hover:bg-forest-50/50 transition-colors ${reorderable ? 'cursor-move' : ''}`}
                >
                  <td className="px-2 py-3 text-forest-300"><GripVertical size={16} /></td>
                  <td className="px-4 py-3 font-medium text-forest-900 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {t.image ? (
                        <img src={t.image} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-forest-100 text-forest-600 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                          {t.name.split(' ').map(w => w[0]).join('')}
                        </div>
                      )}
                      {t.name}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-forest-600 whitespace-nowrap">{t.city || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex text-gold-accent">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={13} fill={i < t.rating ? 'currentColor' : 'none'} />
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-forest-600 max-w-[280px] truncate">{t.text}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(t)} className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full transition-colors ${t.isActive ? 'badge-green' : 'bg-gray-200 text-gray-700'}`}>
                      {t.isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                      {t.isActive ? 'Active' : 'Hidden'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-forest-600">{t.displayOrder}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setModalState(t)} className="p-1.5 rounded-lg hover:bg-forest-100 text-forest-400 hover:text-forest-900 transition-colors" title="Edit">
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => setDeleteTarget(t)} className="p-1.5 rounded-lg hover:bg-red-100 text-forest-400 hover:text-red-500 transition-colors" title="Delete">
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
        <TestimonialModal
          testimonial={modalState._id ? modalState : null}
          onClose={() => setModalState(null)}
          onSaved={() => { setModalState(null); load() }}
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <Trash2 size={32} className="mx-auto text-red-500 mb-3" />
            <h2 className="font-bold text-forest-900 font-serif text-lg mb-1">Delete testimonial?</h2>
            <p className="text-sm text-forest-500 mb-5">
              <span className="font-semibold">{deleteTarget.name}</span>'s testimonial will be permanently removed.
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
