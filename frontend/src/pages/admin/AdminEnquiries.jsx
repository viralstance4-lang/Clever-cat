import { useEffect, useState } from 'react'
import { Mail, MailOpen, Trash2, Search, Phone, X } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api'

export default function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const load = () => {
    setLoading(true)
    api.get('/contact')
      .then(({ data }) => setEnquiries(data.enquiries || []))
      .catch(() => toast.error('Failed to load enquiries'))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const filtered = enquiries.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.email.toLowerCase().includes(search.toLowerCase()) ||
    e.subject?.toLowerCase().includes(search.toLowerCase())
  )

  const openEnquiry = async (e) => {
    setSelected(e)
    if (!e.isRead) {
      try {
        await api.put(`/contact/${e._id}/read`, { isRead: true })
        setEnquiries(prev => prev.map(x => x._id === e._id ? { ...x, isRead: true } : x))
      } catch { /* non-critical */ }
    }
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/contact/${deleteTarget._id}`)
      setEnquiries(prev => prev.filter(e => e._id !== deleteTarget._id))
      toast.success('Enquiry deleted')
      if (selected?._id === deleteTarget._id) setSelected(null)
    } catch {
      toast.error('Failed to delete enquiry')
    } finally {
      setDeleteTarget(null)
    }
  }

  const unreadCount = enquiries.filter(e => !e.isRead).length

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-forest-900 font-serif">Enquiries</h1>
        <p className="text-sm text-forest-500 mt-0.5">{enquiries.length} total · {unreadCount} unread — from the Contact Us form</p>
      </div>

      <div className="relative max-w-xs">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-forest-300" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          className="input pl-9" placeholder="Search enquiries..." />
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-forest-400">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-forest-400">
            <Mail size={28} className="mx-auto mb-2 opacity-50" />
            No enquiries yet
          </div>
        ) : (
          <ul className="divide-y divide-forest-50">
            {filtered.map(e => (
              <li key={e._id}>
                <button onClick={() => openEnquiry(e)}
                  className={`w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-forest-50/50 transition-colors ${!e.isRead ? 'bg-pink-50/40' : ''}`}>
                  {e.isRead ? <MailOpen size={18} className="text-forest-300 flex-shrink-0" /> : <Mail size={18} className="text-gold-accent flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm truncate ${!e.isRead ? 'font-bold text-forest-900' : 'font-medium text-forest-700'}`}>{e.name}</p>
                      <span className="text-xs text-forest-400 truncate">{e.email}</span>
                    </div>
                    <p className="text-xs text-forest-500 truncate mt-0.5">{e.subject || e.message}</p>
                  </div>
                  <span className="text-xs text-forest-400 flex-shrink-0">{new Date(e.createdAt).toLocaleDateString()}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelected(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-forest-100 px-5 py-4 flex items-center justify-between z-10">
              <h2 className="font-bold text-forest-900 font-serif text-lg">{selected.subject || 'Enquiry'}</h2>
              <button onClick={() => setSelected(null)} className="p-2 rounded-lg hover:bg-forest-50 text-forest-400"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-forest-100 flex items-center justify-center text-forest-700 font-bold">{selected.name[0]?.toUpperCase()}</div>
                <div>
                  <p className="font-semibold text-forest-900 text-sm">{selected.name}</p>
                  <a href={`mailto:${selected.email}`} className="text-xs text-forest-500 hover:text-forest-800">{selected.email}</a>
                </div>
              </div>
              {selected.phone && (
                <p className="text-sm text-forest-600 flex items-center gap-2"><Phone size={14} /> {selected.phone}</p>
              )}
              <div className="bg-forest-50 rounded-xl p-4 text-sm text-forest-700 whitespace-pre-wrap">{selected.message}</div>
              <p className="text-xs text-forest-400">Received {new Date(selected.createdAt).toLocaleString()}</p>
              <div className="flex gap-3 pt-2">
                <a href={`mailto:${selected.email}`} className="btn-gold flex-1 justify-center text-sm">Reply by Email</a>
                <button onClick={() => setDeleteTarget(selected)} className="p-3 rounded-xl bg-red-50 text-red-500 hover:bg-red-100">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <Trash2 size={32} className="mx-auto text-red-500 mb-3" />
            <h2 className="font-bold text-forest-900 font-serif text-lg mb-1">Delete enquiry?</h2>
            <p className="text-sm text-forest-500 mb-5">
              Message from <span className="font-semibold">{deleteTarget.name}</span> will be permanently removed.
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
