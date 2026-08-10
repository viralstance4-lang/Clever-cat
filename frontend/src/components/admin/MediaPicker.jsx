import { useEffect, useRef, useState } from 'react'
import { Image as ImageIcon, Film, FileText, X, Search, Loader2, ChevronLeft, ChevronRight, Check, Upload } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api'

const PAGE_SIZE = 24

// Modal for browsing/searching the shared Media Library and picking one (or
// several) files to reuse elsewhere, instead of uploading a fresh copy.
// type: 'image' | 'video' | 'pdf' | undefined (all) — locks the library to that kind of file.
// multiple: when true, items are toggled and confirmed via a footer button;
// when false (default), clicking an item selects it immediately.
export default function MediaPicker({ type, multiple = false, onSelect, onClose }) {
  const [media, setMedia] = useState([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])
  const fileInputRef = useRef(null)

  const load = () => {
    setLoading(true)
    const params = { page, limit: PAGE_SIZE }
    if (type) params.type = type
    if (search) params.search = search
    api.get('/media', { params })
      .then(({ data }) => {
        setMedia(data.media || [])
        setTotal(data.total || 0)
        setPages(data.pages || 1)
      })
      .catch(() => toast.error('Failed to load media'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [page])

  useEffect(() => {
    const t = setTimeout(() => {
      if (page !== 1) setPage(1)
      else load()
    }, 400)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const acceptAttr = type === 'image' ? 'image/*' : type === 'video' ? 'video/*' : type === 'pdf' ? 'application/pdf' : 'image/*,video/*,application/pdf'

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return
    const formData = new FormData()
    Array.from(files).forEach(f => formData.append('files', f))
    setUploading(true)
    try {
      const { data } = await api.post('/media/upload', formData)
      toast.success(`Uploaded ${data.count} file${data.count === 1 ? '' : 's'}`)
      if (!multiple && data.media?.[0]) {
        onSelect(data.media[0])
        return
      }
      if (page !== 1) setPage(1)
      else load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const toggleSelect = (m) => {
    if (!multiple) { onSelect(m); return }
    setSelectedIds(prev => prev.includes(m._id) ? prev.filter(id => id !== m._id) : [...prev, m._id])
  }

  const confirmMultiple = () => {
    const picked = media.filter(m => selectedIds.includes(m._id))
    onSelect(picked)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="border-b border-forest-100 px-5 py-4 flex items-center justify-between flex-shrink-0">
          <h2 className="font-bold text-forest-900 font-serif text-lg">Choose from Media Library</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-forest-50 text-forest-400"><X size={20} /></button>
        </div>

        <div className="px-5 pt-4 flex flex-col sm:flex-row sm:items-center gap-3 flex-shrink-0">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-forest-300" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="input pl-9" placeholder="Search by filename..." />
          </div>
          <label className="btn-outline-gold text-sm cursor-pointer justify-center flex-shrink-0">
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} Upload new file{multiple ? 's' : ''}
            <input ref={fileInputRef} type="file" multiple={multiple} accept={acceptAttr} className="hidden" onChange={e => handleFiles(e.target.files)} disabled={uploading} />
          </label>
        </div>

        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files) }}
          className={`mx-5 mt-3 flex-1 overflow-y-auto rounded-xl transition-colors ${dragOver ? 'ring-2 ring-forest-800 bg-forest-50' : ''}`}
        >
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pb-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-xl bg-forest-100 animate-pulse" />
              ))}
            </div>
          ) : media.length === 0 ? (
            <div className="py-16 text-center text-forest-400">
              <ImageIcon size={28} className="mx-auto mb-2 opacity-50" />
              No media found. Drag & drop files here, or use "Upload new file" above.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pb-4">
              {media.map(m => {
                const isSelected = multiple && selectedIds.includes(m._id)
                return (
                  <button
                    type="button"
                    key={m._id}
                    onClick={() => toggleSelect(m)}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 bg-forest-50 flex items-center justify-center transition-all ${isSelected ? 'border-forest-800 ring-2 ring-forest-300' : 'border-forest-100 hover:border-forest-400'}`}
                  >
                    {m.type === 'image' ? (
                      <img src={m.url} alt={m.filename} className="w-full h-full object-cover" />
                    ) : m.type === 'pdf' ? (
                      <FileText size={28} className="text-forest-300" />
                    ) : (
                      <Film size={28} className="text-forest-300" />
                    )}
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-forest-800 text-white flex items-center justify-center">
                        <Check size={12} />
                      </div>
                    )}
                    <p className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] px-1.5 py-1 truncate text-left">{m.filename}</p>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-forest-100 flex items-center justify-between flex-shrink-0">
          {pages > 1 ? (
            <div className="flex items-center gap-2">
              <p className="text-xs text-forest-500">Page {page} of {pages} · {total} items</p>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 rounded-lg border border-forest-100 text-forest-500 hover:bg-forest-50 disabled:opacity-40 disabled:cursor-not-allowed">
                <ChevronLeft size={14} />
              </button>
              <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
                className="p-1.5 rounded-lg border border-forest-100 text-forest-500 hover:bg-forest-50 disabled:opacity-40 disabled:cursor-not-allowed">
                <ChevronRight size={14} />
              </button>
            </div>
          ) : <span />}
          {multiple && (
            <button type="button" onClick={confirmMultiple} disabled={selectedIds.length === 0} className="btn-gold text-sm disabled:opacity-50 disabled:cursor-not-allowed">
              Add {selectedIds.length || ''} {selectedIds.length === 1 ? 'file' : 'files'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
