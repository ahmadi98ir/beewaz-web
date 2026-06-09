'use client'

import { useCallback, useRef, useState } from 'react'

export interface UploadedImage {
  url: string
  isPrimary: boolean
}

interface Props {
  value: UploadedImage[]
  onChange: (images: UploadedImage[]) => void
  maxImages?: number
}

interface UploadingItem {
  id: string
  name: string
  progress: number
  error?: string
}

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 2 * 1024 * 1024

export function ImageUploaderV2({ value, onChange, maxImages = 8 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState<UploadingItem[]>([])

  const uploadFile = useCallback(async (file: File) => {
    const id = Math.random().toString(36).slice(2)

    if (!ACCEPTED.includes(file.type)) {
      setUploading((p) => [...p, { id, name: file.name, progress: 0, error: 'فرمت مجاز نیست (JPG/PNG/WebP)' }])
      setTimeout(() => setUploading((p) => p.filter((u) => u.id !== id)), 3000)
      return
    }
    if (file.size > MAX_SIZE) {
      setUploading((p) => [...p, { id, name: file.name, progress: 0, error: 'حجم بیشتر از ۲ مگابایت است' }])
      setTimeout(() => setUploading((p) => p.filter((u) => u.id !== id)), 3000)
      return
    }

    setUploading((p) => [...p, { id, name: file.name, progress: 10 }])

    const formData = new FormData()
    formData.append('file', file)

    // Simulate progress via XHR for real progress events
    await new Promise<void>((resolve) => {
      const xhr = new XMLHttpRequest()
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 90)
          setUploading((p) => p.map((u) => u.id === id ? { ...u, progress: pct } : u))
        }
      }
      xhr.onload = () => {
        if (xhr.status === 200) {
          const { url } = JSON.parse(xhr.responseText) as { url: string }
          setUploading((p) => p.map((u) => u.id === id ? { ...u, progress: 100 } : u))
          setTimeout(() => {
            setUploading((p) => p.filter((u) => u.id !== id))
            onChange([...value, { url, isPrimary: value.length === 0 }])
          }, 400)
        } else {
          const err = JSON.parse(xhr.responseText) as { error?: string }
          setUploading((p) => p.map((u) => u.id === id ? { ...u, error: err.error ?? 'خطا در آپلود' } : u))
          setTimeout(() => setUploading((p) => p.filter((u) => u.id !== id)), 3000)
        }
        resolve()
      }
      xhr.onerror = () => {
        setUploading((p) => p.map((u) => u.id === id ? { ...u, error: 'خطا در اتصال' } : u))
        setTimeout(() => setUploading((p) => p.filter((u) => u.id !== id)), 3000)
        resolve()
      }
      xhr.open('POST', '/api/admin/upload')
      xhr.send(formData)
    })
  }, [value, onChange])

  const handleFiles = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files)
    const remaining = maxImages - value.length - uploading.length
    arr.slice(0, remaining).forEach(uploadFile)
  }, [value.length, uploading.length, maxImages, uploadFile])

  function removeImage(url: string) {
    const next = value.filter((img) => img.url !== url)
    // اگر تصویر اصلی حذف شد، اولین تصویر بعدی را primary کن
    if (next.length > 0 && !next.some((i) => i.isPrimary)) {
      next[0]!.isPrimary = true
    }
    onChange(next)
  }

  function setPrimary(url: string) {
    onChange(value.map((img) => ({ ...img, isPrimary: img.url === url })))
  }

  const canUpload = value.length + uploading.length < maxImages

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      {canUpload && (
        <div
          onDragEnter={(e) => { e.preventDefault(); setDragging(true) }}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }}
          onClick={() => inputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 py-10 px-6 select-none ${
            dragging
              ? 'border-indigo-500/70 bg-indigo-500/10'
              : 'border-white/[0.10] bg-white/[0.02] hover:border-white/[0.20] hover:bg-white/[0.04]'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${dragging ? 'bg-indigo-500/20' : 'bg-white/[0.06]'}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={`w-6 h-6 ${dragging ? 'text-indigo-400' : 'text-white/30'}`}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </div>
          <div className="text-center">
            <p className={`text-sm font-medium transition-colors ${dragging ? 'text-indigo-300' : 'text-white/50'}`}>
              {dragging ? 'رها کنید...' : 'فایل را اینجا بکشید یا کلیک کنید'}
            </p>
            <p className="text-xs text-white/25 mt-1">JPG، PNG، WebP — حداکثر ۲ مگابایت — تا {maxImages} تصویر</p>
          </div>
        </div>
      )}

      {/* Uploading progress items */}
      {uploading.length > 0 && (
        <div className="space-y-2">
          {uploading.map((u) => (
            <div key={u.id} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
              <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                {u.error ? (
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-red-400">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-indigo-400">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/60 truncate">{u.name}</p>
                {u.error ? (
                  <p className="text-xs text-red-400 mt-0.5">{u.error}</p>
                ) : (
                  <div className="mt-1.5 h-1 rounded-full bg-white/[0.08] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-500 transition-all duration-300"
                      style={{ width: `${u.progress}%` }}
                    />
                  </div>
                )}
              </div>
              {!u.error && (
                <span className="text-[10px] font-mono text-white/30">{u.progress}%</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Image grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {value.map((img) => (
            <div key={img.url} className="relative group aspect-square rounded-xl overflow-hidden border border-white/[0.08] bg-white/[0.04]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="w-full h-full object-cover" />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                {!img.isPrimary && (
                  <button
                    type="button"
                    onClick={() => setPrimary(img.url)}
                    className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-indigo-500/80 hover:bg-indigo-500 text-white transition-colors"
                  >
                    تصویر اصلی
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(img.url)}
                  className="w-7 h-7 rounded-lg bg-red-500/70 hover:bg-red-500 flex items-center justify-center transition-colors"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-white">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              {/* Primary badge */}
              {img.isPrimary && (
                <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-indigo-500/90 text-[9px] font-bold text-white">
                  اصلی
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
