import { useEffect, useRef, useState } from 'react'
import {
  Plus, Edit2, Trash2, Megaphone, X, Search, Loader2, ToggleLeft, ToggleRight, GripVertical, Link2,
  Leaf, Truck, Star, Gift, Percent, Sparkles, Heart, Tag, ShieldCheck, Clock, Phone, BadgePercent,
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api'

const ICONS = {
  Leaf, Truck, Star, Gift, Percent, Sparkles, Heart, Tag, ShieldCheck, Clock, Phone, BadgePercent,
}

const emptyForm = { text: '', link: '', icon: 'Sparkles', displayOrder: '0', isActive: true }

function IconPicker({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(ICONS).map(([name, Icon]) => (
        <button
          key={name}
          type="button"
          onClick={() => onChange(name)}
          title={name}
          className={`w-9 h-9 rounded-lg flex items-center justify-center border transition-colors ${
            value === name
              ? 'bg-forest-800 border-forest-800 text-white'
              : 'border-forest-200 text-forest-500 hover:bg-forest-50'
          }`}
        >
          <Icon size={15} />
        </button>
      ))}
    </div>
  )
}

function AnnouncementModal({ announcement, onClose, onSaved }) {
  const isEdit = !!announcement
  const [form, setForm] = useState(() =>
    announcement
      ? { ...emptyForm, ...announcement, displayOrder: String(announcement.displayOrder ?? 0) }
      : emptyForm
  )
  const [saving, setSaving] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.text.trim()) return toast.error('Announcement text is required')
    setSaving(true)
    try {
      const payload = {
        text: form.text.trim(),
        link: form.link.trim(),
        icon: form.icon,
        isActive: form.isActive,
        displayOrder: Number(form.displayOrder) || 0,
      }
      if (isEdit) {
        await api.put(`/announcements/${announcement._id}`, payload)
        toast.success('Announcement updated')
      } else {
        await api.post('/announcements', payload)
        toast.success('Announcement created')
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
          <h2 className="font-bold text-forest-900 font-serif text-lg">{isEdit ? 'Edit Announcement' : 'Add Announcement'}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-forest-50 text-forest-400"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs text-forest-500 mb-1.5">Text *</label>
            <input name="text" value={form.text} onChange={handleChange} className="input" placeholder="Flat 10% off your first order" required />
          </div>

          <div>
            <label className="block text-xs text-forest-500 mb-1.5 flex items-center gap-1.5">
              <Link2 size={13} /> Link <span className="text-forest-400">(optional — makes it clickable)</span>
            </label>
            <input name="link" value={form.link} onChange={handleChange} className="input" placeholder="/shop or https://wa.me/919876543210" />
          </div>

          <div>
            <label className="block text-xs text-forest-500 mb-2">Icon</label>
            <IconPicker value={form.icon} onChange={icon => setForm(f => ({ ...f, icon }))} />
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
            {saving ? <Loader2 size={16} className="animate-spin" /> : null} {isEdit ? 'Update Announcement' : 'Create Announcement'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalState, setModalState] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const dragItem = useRef(null)
  const dragOverItem = useRef(null)

  const load = () => {
    setLoading(true)
    api.get('/announcements')
      .then(({ data }) => setAnnouncements(data.announcements || []))
      .catch(() => toast.error('Failed to load announcements'))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const filtered = announcements.filter(a => a.text.toLowerCase().includes(search.toLowerCase()))
  const reorderable = !search

  const toggleActive = async (a) => {
    try {
      await api.put(`/announcements/${a._id}`, { isActive: !a.isActive })
      setAnnouncements(prev => prev.map(x => x._id === a._id ? { ...x, isActive: !a.isActive } : x))
    } catch {
      toast.error('Failed to update status')
    }
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/announcements/${deleteTarget._id}`)
      setAnnouncements(prev => prev.filter(a => a._id !== deleteTarget._id))
      toast.success('Announcement deleted')
    } catch {
      toast.error('Failed to delete announcement')
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

    const reordered = [...announcements]
    const [moved] = reordered.splice(from, 1)
    reordered.splice(to, 0, moved)
    const withOrder = reordered.map((a, i) => ({ ...a, displayOrder: i }))
    setAnnouncements(withOrder)

    try {
      await api.put('/announcements/reorder', {
        order: withOrder.map(a => ({ _id: a._id, displayOrder: a.displayOrder })),
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
          <h1 className="text-2xl font-bold text-forest-900 font-serif">Announcement Bar</h1>
          <p className="text-sm text-forest-500 mt-0.5">{announcements.length} total announcements · drag rows to reorder</p>
        </div>
        <button onClick={() => setModalState({})} className="btn-gold text-sm">
          <Plus size={16} /> Add Announcement
        </button>
      </div>

      <div className="card p-4 text-sm text-forest-600 bg-forest-50/50 border border-forest-100">
        Announcements marked <span className="font-semibold">Active</span> scroll as a continuous marquee in the top bar of the storefront. Add a link to make an item clickable.
      </div>

      <div className="relative max-w-xs">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-forest-300" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          className="input pl-9" placeholder="Search announcements..." />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-forest-100">
                {['', 'Icon', 'Text', 'Link', 'Status', 'Order', ''].map((h, i) => (
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
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-forest-100 rounded animate-pulse" style={{ width: `${50 + j * 4}%` }} /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-forest-400">
                    <Megaphone size={28} className="mx-auto mb-2 opacity-50" />
                    No announcements found. Click "Add Announcement" to create your first one.
                  </td>
                </tr>
              ) : filtered.map((a, index) => {
                const Icon = ICONS[a.icon] || Sparkles
                return (
                  <tr
                    key={a._id}
                    draggable={reorderable}
                    onDragStart={() => handleDragStart(index)}
                    onDragEnter={() => handleDragEnter(index)}
                    onDragEnd={handleDragEnd}
                    onDragOver={e => e.preventDefault()}
                    className={`border-b border-forest-50 hover:bg-forest-50/50 transition-colors ${reorderable ? 'cursor-move' : ''}`}
                  >
                    <td className="px-2 py-3 text-forest-300"><GripVertical size={16} /></td>
                    <td className="px-4 py-3">
                      <span className="w-8 h-8 rounded-lg bg-forest-100 flex items-center justify-center text-forest-700">
                        <Icon size={15} />
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-forest-900 max-w-[280px] truncate">{a.text}</td>
                    <td className="px-4 py-3 text-forest-500 text-xs max-w-[160px] truncate">{a.link || '—'}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleActive(a)} className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full transition-colors ${a.isActive ? 'badge-green' : 'bg-gray-200 text-gray-700'}`}>
                        {a.isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                        {a.isActive ? 'Active' : 'Hidden'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-forest-600">{a.displayOrder}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setModalState(a)} className="p-1.5 rounded-lg hover:bg-forest-100 text-forest-400 hover:text-forest-900 transition-colors" title="Edit">
                          <Edit2 size={15} />
                        </button>
                        <button onClick={() => setDeleteTarget(a)} className="p-1.5 rounded-lg hover:bg-red-100 text-forest-400 hover:text-red-500 transition-colors" title="Delete">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {modalState !== null && (
        <AnnouncementModal
          announcement={modalState._id ? modalState : null}
          onClose={() => setModalState(null)}
          onSaved={() => { setModalState(null); load() }}
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <Trash2 size={32} className="mx-auto text-red-500 mb-3" />
            <h2 className="font-bold text-forest-900 font-serif text-lg mb-1">Delete announcement?</h2>
            <p className="text-sm text-forest-500 mb-5">
              <span className="font-semibold">{deleteTarget.text}</span> will be permanently removed.
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
