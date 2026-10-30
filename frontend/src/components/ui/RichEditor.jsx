import { useEffect, useRef, useState } from 'react'
import { Bold, Italic, Underline, List, ListOrdered, Link, Image as ImageIcon, Loader2, FolderOpen, Upload, X } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api'
import MediaPicker from '../admin/MediaPicker'

export default function RichEditor({ value, onChange, minHeight = 260 }) {
  const editorRef = useRef(null)
  const wrapperRef = useRef(null)
  const fileInputRef = useRef(null)
  const savedRangeRef = useRef(null)
  const draggedImgRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [showImageMenu, setShowImageMenu] = useState(false)
  const [showMediaPicker, setShowMediaPicker] = useState(false)
  const [selectedImg, setSelectedImg] = useState(null)
  const [imgRect, setImgRect] = useState(null)

  // Only push `value` into the DOM when it changes from outside (e.g. loading
  // an existing product) — never while the user is typing, otherwise resetting
  // innerHTML on every keystroke resets the cursor to the start each time.
  useEffect(() => {
    const el = editorRef.current
    if (el && value !== el.innerHTML) {
      el.innerHTML = value || ''
    }
    setSelectedImg(null)
  }, [value])

  // Tracks the bounding box of the currently-selected image so the floating
  // delete button can be positioned over it, and keeps it in sync while the
  // page scrolls or resizes.
  useEffect(() => {
    if (!selectedImg) { setImgRect(null); return }
    const update = () => {
      const wrapperBox = wrapperRef.current.getBoundingClientRect()
      const imgBox = selectedImg.getBoundingClientRect()
      setImgRect({ top: imgBox.top - wrapperBox.top, left: imgBox.left - wrapperBox.left + imgBox.width })
    }
    update()
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [selectedImg])

  const exec = (cmd, val = null) => document.execCommand(cmd, false, val)

  const insertLink = () => {
    const url = prompt('Enter URL:')
    if (url) exec('createLink', url)
  }

  // Toolbar buttons steal focus when clicked, which collapses the editor's
  // text selection before the async upload resolves — so the cursor position
  // is captured up front and restored right before inserting the image.
  const saveSelection = () => {
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0 && editorRef.current?.contains(sel.anchorNode)) {
      savedRangeRef.current = sel.getRangeAt(0)
    }
  }

  const insertImageUrl = (url) => {
    editorRef.current?.focus()
    const sel = window.getSelection()
    if (savedRangeRef.current) {
      sel.removeAllRanges()
      sel.addRange(savedRangeRef.current)
    }
    exec('insertHTML', `<img src="${url}" alt="" draggable="true" style="max-width:100%;border-radius:12px;margin:16px 0;display:block;cursor:grab;" />`)
    onChange(editorRef.current.innerHTML)
  }

  // Lets the admin drag an inserted image to reposition it between
  // paragraphs/sections — native contentEditable drag isn't reliable across
  // browsers, so the move is handled explicitly via HTML5 drag-and-drop.
  const handleDragStart = (e) => {
    if (e.target.tagName === 'IMG') {
      draggedImgRef.current = e.target
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/plain', '')
    }
  }

  const handleDragOver = (e) => {
    if (draggedImgRef.current) {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
    }
  }

  const handleDrop = (e) => {
    const img = draggedImgRef.current
    if (!img) return
    e.preventDefault()
    let range = null
    if (document.caretRangeFromPoint) {
      range = document.caretRangeFromPoint(e.clientX, e.clientY)
    } else if (document.caretPositionFromPoint) {
      const pos = document.caretPositionFromPoint(e.clientX, e.clientY)
      if (pos) {
        range = document.createRange()
        range.setStart(pos.offsetNode, pos.offset)
        range.collapse(true)
      }
    }
    if (range && editorRef.current?.contains(range.startContainer)) {
      img.remove()
      range.insertNode(img)
    }
    draggedImgRef.current = null
    onChange(editorRef.current.innerHTML)
  }

  const openUploadFromDevice = () => {
    saveSelection()
    setShowImageMenu(false)
    fileInputRef.current?.click()
  }

  const openMediaLibrary = () => {
    saveSelection()
    setShowImageMenu(false)
    setShowMediaPicker(true)
  }

  const handleImageFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('files', file)
      const { data } = await api.post('/media/upload', formData)
      const url = data.media?.[0]?.url
      if (!url) throw new Error('Upload failed')
      insertImageUrl(url)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Image upload failed')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleMediaPicked = (m) => {
    setShowMediaPicker(false)
    if (m?.url) insertImageUrl(m.url)
  }

  const handleEditorClick = (e) => {
    setSelectedImg(e.target.tagName === 'IMG' ? e.target : null)
  }

  const deleteSelectedImg = () => {
    selectedImg?.remove()
    setSelectedImg(null)
    onChange(editorRef.current.innerHTML)
  }

  return (
    <div>
      <div className="flex flex-wrap gap-1 p-2 bg-forest-50 border border-forest-200 rounded-t-xl">
        {[
          { cmd: 'bold',      label: <Bold size={14} /> },
          { cmd: 'italic',    label: <Italic size={14} /> },
          { cmd: 'underline', label: <Underline size={14} /> },
        ].map(({ cmd, label }) => (
          <button key={cmd} type="button"
            onMouseDown={e => { e.preventDefault(); exec(cmd) }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-forest-600 hover:bg-forest-100 hover:text-forest-900 transition-colors">
            {label}
          </button>
        ))}
        <div className="w-px h-6 bg-forest-200 mx-1 self-center" />
        {[
          { cmd: 'insertUnorderedList', label: <List size={14} /> },
          { cmd: 'insertOrderedList',   label: <ListOrdered size={14} /> },
        ].map(({ cmd, label }) => (
          <button key={cmd} type="button"
            onMouseDown={e => { e.preventDefault(); exec(cmd) }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-forest-600 hover:bg-forest-100 hover:text-forest-900 transition-colors">
            {label}
          </button>
        ))}
        <div className="w-px h-6 bg-forest-200 mx-1 self-center" />
        {['h2', 'h3', 'p'].map(tag => (
          <button key={tag} type="button"
            onMouseDown={e => { e.preventDefault(); exec('formatBlock', tag) }}
            className="px-2.5 h-8 rounded-lg text-xs font-semibold uppercase text-forest-600 hover:bg-forest-100 hover:text-forest-900 transition-colors">
            {tag}
          </button>
        ))}
        <div className="w-px h-6 bg-forest-200 mx-1 self-center" />
        <button type="button"
          onMouseDown={e => { e.preventDefault(); insertLink() }}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-forest-600 hover:bg-forest-100 hover:text-forest-900 transition-colors">
          <Link size={14} />
        </button>
        <div className="relative">
          <button type="button"
            disabled={uploading}
            title="Insert image"
            onMouseDown={e => { e.preventDefault(); saveSelection(); setShowImageMenu(v => !v) }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-forest-600 hover:bg-forest-100 hover:text-forest-900 transition-colors disabled:opacity-50">
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <ImageIcon size={14} />}
          </button>
          {showImageMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowImageMenu(false)} />
              <div className="absolute left-0 top-full mt-1 z-20 bg-white border border-forest-100 rounded-xl shadow-lg py-1 w-48">
                <button type="button"
                  onMouseDown={e => { e.preventDefault(); openMediaLibrary() }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-forest-700 hover:bg-forest-50 text-left">
                  <FolderOpen size={14} /> Choose from Media
                </button>
                <button type="button"
                  onMouseDown={e => { e.preventDefault(); openUploadFromDevice() }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-forest-700 hover:bg-forest-50 text-left">
                  <Upload size={14} /> Upload from device
                </button>
              </div>
            </>
          )}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
      </div>
      <div ref={wrapperRef} className="relative">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={e => onChange(e.currentTarget.innerHTML)}
          onClick={handleEditorClick}
          onBlur={() => setSelectedImg(null)}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onDragEnd={() => { draggedImgRef.current = null }}
          style={{ minHeight }}
          className="min-h-[var(--rte-h)] p-4 bg-white border border-forest-200 border-t-0 rounded-b-xl outline-none focus:ring-2 focus:ring-forest-800 cursor-text prose prose-sm max-w-none"
        />
        {selectedImg && imgRect && (
          <button
            type="button"
            title="Remove image"
            onMouseDown={e => e.preventDefault()}
            onClick={deleteSelectedImg}
            className="absolute z-20 w-7 h-7 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg"
            style={{ top: imgRect.top + 8, left: imgRect.left - 8 }}
          >
            <X size={14} />
          </button>
        )}
      </div>
      {showMediaPicker && (
        <MediaPicker type="image" onSelect={handleMediaPicked} onClose={() => setShowMediaPicker(false)} />
      )}
    </div>
  )
}
