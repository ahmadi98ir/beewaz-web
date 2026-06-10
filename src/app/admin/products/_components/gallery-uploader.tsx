'use client'

import { useCallback, useRef, useState } from 'react'

interface Props {
  value: string[]           // آرایه‌ای از URL ها
  onChange: (urls: string[]) => void
  maxImages?: number
}

interface UploadingItem { id: string; name: string; progress: number; error?: string }

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE  = 2 * 1024 * 1024

export function GalleryUploader({ value, onChange, maxImages = 7 }: Props) {
  const inputRef  = useRef<HTMLInputElement>(null)
  const [dragging,  setDragging]  = useState(false)
  const [uploading, setUploading] = useState<UploadingItem[]>([])

  // --- مرجع به value برای دسترسی بدون stale closure در XHR callback ---
  const valueRef = useRef(value)
  valueRef.current = value

  const uploadFile = useCallback((file: File) => {
    const id = crypto.randomUUID()

    if (!ACCEPTED.includes(file.type)) {
      setUploading((p) => [...p, { id, name: file.name, progress: 0, error: 'فرمت مجاز نیست' }])
      setTimeout(() => setUploading((p) => p.filter((u) => u.id !== id)), 3000)
      return
    }
    if (file.size > MAX_SIZE) {
      setUploading((p) => [...p, { id, name: file.name, progress: 0, error: 'حجم بیشتر از ۲ مگابایت' }])
      setTimeout(() => setUploading((p) => p.filter((u) => u.id !== id)), 3000)
      return
    }

    setUploading((p) => [...p, { id, name: file.name, progress: 5 }])

    const fd = new FormData()
    fd.append('file', file)

    const xhr = new XMLHttpRequest()
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable)
        setUploading((p) => p.map((u) => u.id === id ? { ...u, progress: Math.round((e.loaded / e.total) * 90) } : u))
    }
    xhr.onload = () => {
      if (xhr.status === 200) {
        const { url } = JSON.parse(xhr.responseText) as { url: string }
        setUploading((p) => p.map((u) => u.id === id ? { ...u, progress: 100 } : u))
        setTimeout(() => {
          setUploading((p) => p.filter((u) => u.id !== id))
          // استفاده از valueRef تا stale closure نداشته باشیم
          onChange([...valueRef.current, url])
        }, 350)
      } else {
        const err = JSON.parse(xhr.responseText) as { error?: string }
        setUploading((p) => p.map((u) => u.id === id ? { ...u, error: err.error ?? 'خطا' } : u))
        setTimeout(() => setUploading((p) => p.filter((u) => u.id !== id)), 3000)
      }
    }
    xhr.onerror = () => {
      setUploading((p) => p.map((u) => u.id === id ? { ...u, error: 'خطا در اتصال' } : u))
      setTimeout(() => setUploading((p) => p.filter((u) => u.id !== id)), 3000)
    }
    xhr.open('POST', '/api/admin/upload')
    xhr.send(fd)
  }, [onChange])

  const handleFiles = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files)
    const remaining = maxImages - value.length - uploading.length
    arr.slice(0, remaining).forEach(uploadFile)
  }, [value.length, uploading.length, maxImages, uploadFile])

  const canUpload = value.length + uploading.length < maxImages

  return (
    <div className="space-y-4">
      {/* Grid: تصاویر موجود + progress items */}
      {(value.length > 0 || uploading.length > 0) && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {/* تصاویر آپلودشده */}
          {value.map((url, idx) => (
            <div key={url} className="relative group aspect-square rounded-xl overflow-hidden border border-white/[0.08] bg-white/[0.04]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`گالری ${idx + 1}`} className="w-full h-full object-cover" />

              {/* شماره */}
              <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-md bg-black/50 backdrop-blur flex items-center justify-center text-[9px] font-bold text-white">
                {idx + 1}
              </div>

              {/* overlay حذف */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => onChange(value.filter((u) => u !== url))}
                  className="w-8 h-8 rounded-lg bg-red-500/80 hover:bg-red-500 flex items-center justify-center transition-colors"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-white">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          ))}

          {/* آیتم‌های در حال آپلود */}
          {uploading.map((u) => (
            <div key={u.id} className="aspect-square rounded-xl border border-white/[0.08] bg-white/[0.04] flex flex-col items-center justify-center gap-2 p-3">
              {u.error ? (
                <>
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-red-400">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-[9px] text-red-400 text-center leading-tight">{u.error}</p>
                </>
              ) : (
                <>
                  <div className="w-full h-1 rounded-full bg-white/[0.08] overflow-hidden">
                    <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${u.progress}%` }} />
                  </div>
                  <p className="text-[9px] text-white/30 truncate w-full text-center">{u.name}</p>
                  <span className="text-[9px] font-mono text-indigo-400">{u.progress}%</span>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Drop Zone (نمایش فقط وقتی ظرفیت دارد) */}
      {canUpload && (
        <div
          onDragEnter={(e) => { e.preventDefault(); setDragging(true) }}
          onDragOver={(e)  => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }}
          onClick={() => inputRef.current?.click()}
          className={`flex items-center justify-center gap-3 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 py-5 px-6 select-none ${
            dragging
              ? 'border-indigo-500/70 bg-indigo-500/10'
              : 'border-white/[0.08] bg-white/[0.02] hover:border-white/[0.18] hover:bg-white/[0.04]'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            multiple
            className="hidden"
            onChange={(e) => { if (e.target.files) { handleFiles(e.target.files); e.target.value = '' } }}
          />
          <svg viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 flex-shrink-0 ${dragging ? 'text-indigo-400' : 'text-white/25'}`}>
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
          <div>
            <p className={`text-xs font-medium ${dragging ? 'text-indigo-300' : 'text-white/40'}`}>
              {dragging ? 'رها کنید...' : 'افزودن تصاویر گالری'}
            </p>
            <p className="text-[10px] text-white/20 mt-0.5">
              {maxImages - value.length} تصویر دیگر — JPG، PNG، WebP — حداکثر ۲ مگابایت
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
