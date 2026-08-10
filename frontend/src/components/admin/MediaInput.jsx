import { useRef, useState } from 'react'
import { Upload, FolderOpen, Image as ImageIcon, Film, Loader2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api'
import MediaPicker from './MediaPicker'

// Shared "Shopify/WordPress style" upload chooser: every image/video field in
// the admin gets the same two options — pick something already uploaded from
// the shared Media Library, or upload a fresh file from this device.
// value/onChange carry a plain URL string, so callers never touch File objects.
export default function MediaInput({
  value,
  onChange,
  accept = 'image',                 // 'image' | 'video'
  layout = 'inline',                 // 'inline' (small preview + side buttons) | 'stack' (wide preview on top)
  previewClassName = 'w-20 h-20 rounded-xl',
  onRemove,
  disabled = false,
}) {
  const [uploading, setUploading] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const fileInputRef = useRef(null)

  const mediaType = accept === 'video' ? 'video' : 'image'
  const acceptAttr = accept === 'video' ? 'video/*' : 'image/*'

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('files', file)
      const { data } = await api.post('/media/upload', formData)
      const url = data.media?.[0]?.url
      if (url) onChange(url)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const preview = (
    <div className={`relative border border-forest-200 bg-forest-50 flex items-center justify-center overflow-hidden flex-shrink-0 ${previewClassName}`}>
      {uploading ? (
        <Loader2 size={22} className="text-forest-800 animate-spin" />
      ) : value ? (
        accept === 'video' ? (
          <video src={value} className="w-full h-full object-cover" muted />
        ) : (
          <img src={value} alt="" className="w-full h-full object-cover" />
        )
      ) : accept === 'video' ? (
        <Film size={22} className="text-forest-300" />
      ) : (
        <ImageIcon size={22} className="text-forest-300" />
      )}
      {value && !uploading && onRemove && (
        <button type="button" onClick={onRemove}
          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center">
          <X size={11} />
        </button>
      )}
    </div>
  )

  const buttons = (
    <div className={`flex gap-1.5 ${layout === 'stack' ? 'w-full' : 'flex-col'}`}>
      <button type="button" disabled={disabled || uploading} onClick={() => setPickerOpen(true)}
        className={`btn-outline-gold text-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${layout === 'stack' ? 'flex-1 justify-center' : ''}`}>
        <FolderOpen size={13} /> Choose from Media
      </button>
      <label className={`btn-outline-gold text-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${layout === 'stack' ? 'flex-1 justify-center' : ''} ${disabled || uploading ? 'pointer-events-none opacity-50' : ''}`}>
        <Upload size={13} /> Upload from device
        <input ref={fileInputRef} type="file" accept={acceptAttr} className="hidden" onChange={handleFile} disabled={disabled || uploading} />
      </label>
    </div>
  )

  return (
    <>
      {layout === 'stack' ? (
        <div className="space-y-2">
          {preview}
          {buttons}
        </div>
      ) : (
        <div className="flex items-center gap-3">
          {preview}
          {buttons}
        </div>
      )}

      {pickerOpen && (
        <MediaPicker
          type={mediaType}
          onSelect={(item) => { onChange(item.url); setPickerOpen(false) }}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </>
  )
}
