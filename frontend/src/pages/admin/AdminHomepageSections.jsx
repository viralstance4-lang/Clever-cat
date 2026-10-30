import { useEffect, useRef, useState } from 'react'
import { LayoutTemplate, GripVertical, Save, Loader2, Eye, EyeOff, Plus, Edit2, Trash2, X, Image as ImageIcon, Search, Package } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api'
import MediaInput from '../../components/admin/MediaInput'

const emptyCustomForm = {
  heading: '', badge: '', subtitle: '', imageUrl: '', buttonText: '', buttonUrl: '',
  productSource: 'none', categorySlug: '', productLimit: '8',
}

function ProductMultiPicker({ selected, onChange }) {
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

  const addProduct = (p) => {
    if (!selected.some(s => s._id === p._id)) onChange([...selected, p])
    setOpen(false)
    setQuery('')
  }
  const removeProduct = (id) => onChange(selected.filter(s => s._id !== id))
  const availableResults = results.filter(p => !selected.some(s => s._id === p._id))

  return (
    <div className="space-y-2">
      {selected.length > 0 && (
        <div className="space-y-2">
          {selected.map(p => (
            <div key={p._id} className="flex items-center gap-3 border border-forest-200 rounded-xl p-2.5 bg-forest-50">
              <img src={p.images?.[0]?.url} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-white" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-forest-900 truncate">{p.name}</p>
                <p className="text-xs text-forest-500">₹{p.price}</p>
              </div>
              <button type="button" onClick={() => removeProduct(p._id)} className="p-1.5 rounded-lg hover:bg-white text-forest-400 flex-shrink-0" title="Remove">
                <X size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="relative">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-forest-300" />
          <input
            value={query}
            onChange={e => { setQuery(e.target.value); setOpen(true) }}
            onFocus={() => setOpen(true)}
            className="input pl-9"
            placeholder={selected.length ? 'Search to add another book...' : 'Search books by name...'}
          />
          {loading && <Loader2 size={15} className="animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-forest-300" />}
        </div>
        {open && query.trim().length >= 2 && (
          <div className="absolute z-20 mt-1 w-full bg-white border border-forest-100 rounded-xl shadow-lg max-h-64 overflow-y-auto">
            {availableResults.length === 0 && !loading ? (
              <p className="px-4 py-3 text-sm text-forest-400">No products found</p>
            ) : availableResults.map(p => (
              <button type="button" key={p._id} onClick={() => addProduct(p)}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-forest-50 text-left transition-colors">
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
    </div>
  )
}

function CustomSectionModal({ section, onClose, onSaved }) {
  const isEdit = !!section
  const [form, setForm] = useState(() => section ? {
    heading: section.heading || '',
    badge: section.badge || '',
    subtitle: section.subtitle || '',
    imageUrl: section.imageUrl || '',
    buttonText: section.buttonText || '',
    buttonUrl: section.buttonUrl || '',
    productSource: section.productSource || 'none',
    categorySlug: section.categorySlug || '',
    productLimit: String(section.productLimit ?? 8),
  } : emptyCustomForm)
  const [manualProducts, setManualProducts] = useState(section?.productIds || [])
  const [categories, setCategories] = useState([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data.categories || [])).catch(() => setCategories([]))
  }, [])

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.heading.trim()) return toast.error('Heading is required')
    if (form.productSource === 'category' && !form.categorySlug) return toast.error('Please choose a category')
    if (form.productSource === 'manual' && manualProducts.length === 0) return toast.error('Please pick at least one book')
    setSaving(true)
    try {
      const payload = {
        ...form,
        productLimit: Number(form.productLimit) || 8,
        productIds: form.productSource === 'manual' ? manualProducts.map(p => p._id) : [],
      }
      if (isEdit) {
        await api.put(`/homepage-sections/${section.key}`, payload)
        toast.success('Section updated')
      } else {
        await api.post('/homepage-sections/custom', payload)
        toast.success('Custom section added')
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
          <h2 className="font-bold text-forest-900 font-serif text-lg">{isEdit ? 'Edit Custom Section' : 'Add Custom Section'}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-forest-50 text-forest-400"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs text-forest-500 mb-1.5">Badge <span className="text-forest-400">(optional)</span></label>
            <input name="badge" value={form.badge} onChange={handleChange} className="input" placeholder="e.g. Limited Time" />
          </div>
          <div>
            <label className="block text-xs text-forest-500 mb-1.5">Heading *</label>
            <input name="heading" value={form.heading} onChange={handleChange} className="input" placeholder="e.g. Festive Collection" required />
          </div>
          <div>
            <label className="block text-xs text-forest-500 mb-1.5">Subtitle / Description <span className="text-forest-400">(optional)</span></label>
            <textarea name="subtitle" value={form.subtitle} onChange={handleChange} rows={3} className="input" placeholder="A short line of supporting text shown under the heading" />
          </div>
          <div>
            <label className="block text-xs text-forest-500 mb-1.5 flex items-center gap-1.5"><ImageIcon size={13} /> Image <span className="text-forest-400">(optional)</span></label>
            <MediaInput
              value={form.imageUrl}
              onChange={(url) => setForm(f => ({ ...f, imageUrl: url }))}
              accept="image"
              layout="inline"
              previewClassName="w-20 h-20 rounded-xl"
              onRemove={() => setForm(f => ({ ...f, imageUrl: '' }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-forest-500 mb-1.5">Button Text <span className="text-forest-400">(optional)</span></label>
              <input name="buttonText" value={form.buttonText} onChange={handleChange} className="input" placeholder="Shop Now" />
            </div>
            <div>
              <label className="block text-xs text-forest-500 mb-1.5">Button Link <span className="text-forest-400">(optional)</span></label>
              <input name="buttonUrl" value={form.buttonUrl} onChange={handleChange} className="input" placeholder="/shop or https://..." />
            </div>
          </div>

          <div className="border-t border-forest-100 pt-4">
            <label className="block text-xs text-forest-500 mb-1.5 flex items-center gap-1.5"><Package size={13} /> Products to Show <span className="text-forest-400">(optional)</span></label>
            <select name="productSource" value={form.productSource} onChange={handleChange} className="input mb-3">
              <option value="none">No products — text/image only</option>
              <option value="all">All Products</option>
              <option value="category">A Specific Category</option>
              <option value="manual">Hand-Picked Books</option>
            </select>

            {form.productSource === 'category' && (
              <select name="categorySlug" value={form.categorySlug} onChange={handleChange} className="input mb-3">
                <option value="">Select a category…</option>
                {categories.map(c => <option key={c._id} value={c.slug}>{c.name}</option>)}
              </select>
            )}

            {form.productSource === 'manual' && (
              <div className="mb-3">
                <ProductMultiPicker selected={manualProducts} onChange={setManualProducts} />
              </div>
            )}

            {(form.productSource === 'all' || form.productSource === 'category') && (
              <div>
                <label className="block text-xs text-forest-500 mb-1.5">How many products to show</label>
                <input name="productLimit" type="number" min="1" max="24" value={form.productLimit} onChange={handleChange} className="input" />
              </div>
            )}
          </div>

          <button type="submit" disabled={saving} className="btn-gold w-full justify-center text-sm">
            {saving ? <Loader2 size={16} className="animate-spin" /> : null} {isEdit ? 'Update Section' : 'Add Section'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function AdminHomepageSections() {
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)
  const [edits, setEdits] = useState({}) // { [key]: { badge, heading } } — draft values before Save
  const [savingKey, setSavingKey] = useState(null)
  const [modalState, setModalState] = useState(null) // null = closed, {} = add, section = edit
  const [deleteTarget, setDeleteTarget] = useState(null)
  const dragItem = useRef(null)
  const dragOverItem = useRef(null)

  const load = () => {
    setLoading(true)
    api.get('/homepage-sections')
      .then(({ data }) => setSections(data.sections || []))
      .catch(() => toast.error('Failed to load homepage sections'))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const draftFor = (s) => edits[s.key] ?? { badge: s.badge, heading: s.heading, subtitle: s.subtitle }
  const setDraft = (key, field, value) => setEdits(prev => {
    const section = sections.find(s => s.key === key)
    const base = prev[key] ?? { badge: section.badge, heading: section.heading, subtitle: section.subtitle }
    return { ...prev, [key]: { ...base, [field]: value } }
  })

  const toggleVisible = async (s) => {
    try {
      await api.put(`/homepage-sections/${s.key}`, { isVisible: !s.isVisible })
      setSections(prev => prev.map(x => x.key === s.key ? { ...x, isVisible: !s.isVisible } : x))
    } catch {
      toast.error('Failed to update visibility')
    }
  }

  const saveHeading = async (s) => {
    const draft = draftFor(s)
    setSavingKey(s.key)
    try {
      const { data } = await api.put(`/homepage-sections/${s.key}`, { badge: draft.badge, heading: draft.heading, subtitle: draft.subtitle })
      setSections(prev => prev.map(x => x.key === s.key ? data.section : x))
      setEdits(prev => { const next = { ...prev }; delete next[s.key]; return next })
      toast.success('Section updated')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save')
    } finally {
      setSavingKey(null)
    }
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/homepage-sections/${deleteTarget.key}`)
      setSections(prev => prev.filter(s => s.key !== deleteTarget.key))
      toast.success('Section deleted')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete section')
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
    if (from === null || to === null || from === to) return

    const reordered = [...sections]
    const [moved] = reordered.splice(from, 1)
    reordered.splice(to, 0, moved)
    const withOrder = reordered.map((s, i) => ({ ...s, displayOrder: i }))
    setSections(withOrder)

    try {
      await api.put('/homepage-sections/reorder', {
        order: withOrder.map(s => ({ key: s.key, displayOrder: s.displayOrder })),
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
          <h1 className="text-2xl font-bold text-forest-900 font-serif flex items-center gap-2">
            <LayoutTemplate size={24} /> Homepage Builder
          </h1>
          <p className="text-sm text-forest-500 mt-0.5">Drag rows to reorder the homepage, toggle sections on/off, edit headings, or add your own custom sections.</p>
        </div>
        <button onClick={() => setModalState({})} className="btn-gold text-sm">
          <Plus size={16} /> Add Custom Section
        </button>
      </div>

      <div className="card p-4 text-sm text-forest-600 bg-forest-50/50 border border-forest-100">
        Changes here control the <span className="font-semibold">order and visibility</span> of sections on the homepage, and the badge/heading text for sections that have one. Content inside the built-in sections (products, banners, videos, testimonials, age groups, price tiers) is still managed from that section's own page in this sidebar. Built-in sections can be hidden but not deleted; <span className="font-semibold">custom sections</span> you add here can be fully edited or removed.
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-forest-100">
                {['', 'Section', 'Badge', 'Heading', 'Description', 'Visible', ''].map((h, i) => (
                  <th key={i} className="text-left px-4 py-3 text-xs font-semibold text-forest-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-forest-50">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-forest-100 rounded animate-pulse" style={{ width: `${50 + j * 4}%` }} /></td>
                    ))}
                  </tr>
                ))
              ) : sections.map((s, index) => {
                const draft = draftFor(s)
                const dirty = edits[s.key] && (edits[s.key].badge !== s.badge || edits[s.key].heading !== s.heading || edits[s.key].subtitle !== s.subtitle)
                const isCustom = s.type === 'custom'
                return (
                  <tr
                    key={s.key}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragEnter={() => handleDragEnter(index)}
                    onDragEnd={handleDragEnd}
                    onDragOver={e => e.preventDefault()}
                    className={`border-b border-forest-50 hover:bg-forest-50/50 transition-colors cursor-move ${!s.isVisible ? 'opacity-50' : ''}`}
                  >
                    <td className="px-2 py-3 text-forest-300"><GripVertical size={16} /></td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-forest-900">{s.label}</p>
                      {isCustom && <span className="text-[10px] font-semibold bg-forest-100 text-forest-700 px-1.5 py-0.5 rounded-full">Custom</span>}
                    </td>
                    <td className="px-4 py-3">
                      {s.hasHeading ? (
                        <input value={draft.badge} onChange={e => setDraft(s.key, 'badge', e.target.value)}
                          className="input !py-1.5 text-xs max-w-[160px]" placeholder="Badge text" />
                      ) : (
                        <span className="text-forest-300 text-xs italic">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {s.hasHeading ? (
                        <input value={draft.heading} onChange={e => setDraft(s.key, 'heading', e.target.value)}
                          className="input !py-1.5 text-xs min-w-[200px]" placeholder="Heading text" />
                      ) : (
                        <span className="text-forest-300 text-xs italic">No heading for this section</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {s.hasHeading ? (
                        <input value={draft.subtitle} onChange={e => setDraft(s.key, 'subtitle', e.target.value)}
                          className="input !py-1.5 text-xs min-w-[220px]" placeholder="Description text" />
                      ) : (
                        <span className="text-forest-300 text-xs italic">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleVisible(s)} className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full transition-colors ${s.isVisible ? 'badge-green' : 'bg-gray-200 text-gray-700'}`}>
                        {s.isVisible ? <Eye size={13} /> : <EyeOff size={13} />}
                        {s.isVisible ? 'Shown' : 'Hidden'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {s.hasHeading && (
                          <button onClick={() => saveHeading(s)} disabled={!dirty || savingKey === s.key}
                            className="btn-gold !text-xs !px-3 !py-1.5 disabled:opacity-40">
                            {savingKey === s.key ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Save
                          </button>
                        )}
                        {isCustom && (
                          <>
                            <button onClick={() => setModalState(s)} className="p-1.5 rounded-lg hover:bg-forest-100 text-forest-400 hover:text-forest-900 transition-colors" title="Edit content">
                              <Edit2 size={15} />
                            </button>
                            <button onClick={() => setDeleteTarget(s)} className="p-1.5 rounded-lg hover:bg-red-100 text-forest-400 hover:text-red-500 transition-colors" title="Delete">
                              <Trash2 size={15} />
                            </button>
                          </>
                        )}
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
        <CustomSectionModal
          section={modalState.key ? modalState : null}
          onClose={() => setModalState(null)}
          onSaved={() => { setModalState(null); load() }}
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <Trash2 size={32} className="mx-auto text-red-500 mb-3" />
            <h2 className="font-bold text-forest-900 font-serif text-lg mb-1">Delete this section?</h2>
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
