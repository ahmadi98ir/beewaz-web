'use client'

import { useCallback, useRef, useState } from 'react'

interface Props {
  value: string        // URL یا رشته خالی
  onChange: (url: string) => void
}

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE  = 2 * 1024 * 1024

export function MainImageUploader({ value, onChange }: Props) {
  const inputRef  = useRef<HTMLInputElement>(null)
  const [dragging, setDragging]   = useState(false)
  const [progress, setProgress]   = useState<number | null>(null)
  const [errMsg,   setErrMsg]     = useState('')

  const upload = useCallback((file: File) => {
    if (!ACCEPTED.includes(file.type)) { setErrMsg('فقط JPG، PNG یا WebP مجاز است'); return }
    if (file.size > MAX_SIZE)          { setErrMsg('حجم فایل نباید بیشتر از ۲ مگابایت باشد'); return }
    setErrMsg('')
    setProgress(5)

    const fd = new FormData()
    fd.append('file', file)

    const xhr = new XMLHttpRequest()
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 90))
    }
    xhr.onload = () => {
      if (xhr.status === 200) {
        const { url } = JSON.parse(xhr.responseText) as { url: string }
        setProgress(100)
        setTimeout(() => { setProgress(null); onChange(url) }, 350)
      } else {
        const err = JSON.parse(xhr.responseText) as { error?: string }
        setErrMsg(err.error ?? 'خطا در آپلود')
        setProgress(null)
      }
    }
    xhr.onerror = () => { setErrMsg('خطا در اتصال'); setProgress(null) }
    xhr.open('POST', '/api/admin/upload')
    xhr.send(fd)
  }, [onChange])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) upload(file)
  }, [upload])

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) upload(file)
    e.target.value = ''
  }, [upload])

  // ── اگر تصویر آپلود شده ─────────────────────────────────────────────────
  const isValidUrl = value.startsWith('/') || value.startsWith('http')
  if (value && isValidUrl) {
    return (
      <div className="relative rounded-2xl overflow-hidden border border-white/[0.10] bg-white/[0.03] aspect-video max-h-64 group">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={value} alt="تصویر اصلی" className="w-full h-full object-cover" />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* badge */}
        <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-indigo-600/90 text-[10px] font-bold text-white">
          تصویر اصلی
        </div>

        {/* دکمه‌های hover */}
        <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur text-white text-xs font-semibold transition-colors"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            تغییر
          </button>
          <button
            type="button"
            onClick={() => onChange('')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/70 hover:bg-red-500/90 backdrop-blur text-white text-xs font-semibold transition-colors"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            حذف
          </button>
        </div>

        <input ref={inputRef} type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden" onChange={onFileChange} />
      </div>
    )
  }

  // ── Drop Zone ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-2">
      <div
        onDragEnter={(e) => { e.preventDefault(); setDragging(true) }}
        onDragOver={(e)  => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !progress && inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 py-14 px-6 select-none ${
          dragging
            ? 'border-indigo-500/80 bg-indigo-500/10'
            : 'border-white/[0.10] bg-white/[0.02] hover:border-indigo-500/40 hover:bg-indigo-500/[0.04]'
        }`}
      >
        <input ref={inputRef} type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden" onChange={onFileChange} />

        {/* آیکون */}
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${dragging ? 'bg-indigo-500/20' : 'bg-white/[0.06]'}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={`w-8 h-8 transition-colors ${dragging ? 'text-indigo-400' : 'text-white/30'}`}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
        </div>

        <div className="text-center">
          <p className={`text-sm font-semibold transition-colors ${dragging ? 'text-indigo-300' : 'text-white/60'}`}>
            {dragging ? 'رها کنید...' : 'تصویر اصلی محصول را اینجا بکشید'}
          </p>
          <p className="text-xs text-white/25 mt-1">JPG، PNG، WebP — حداکثر ۲ مگابایت — نسبت ۱۶:۹ توصیه می‌شود</p>
          {!dragging && (
            <p className="text-xs text-indigo-400/70 mt-2 font-medium">یا کلیک کنید برای انتخاب فایل</p>
          )}
        </div>

        {/* progress bar */}
        {progress !== null && (
          <div className="absolute inset-x-4 bottom-4">
            <div className="h-1 rounded-full bg-white/[0.08] overflow-hidden">
              <div
                className="h-full rounded-full bg-indigo-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-center text-[10px] text-indigo-400 mt-1">{progress}%</p>
          </div>
        )}
      </div>

      {errMsg && (
        <p className="flex items-center gap-1.5 text-xs text-red-400 px-1">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 flex-shrink-0">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {errMsg}
        </p>
      )}
    </div>
  )
}
