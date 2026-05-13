'use client'

import { useEffect, useRef, useState } from 'react'

interface ProductImage {
  id: string
  url: string
  alt: string | null
  sortOrder: number
}

interface Props {
  productId: string
}

export function ImageUploader({ productId }: Props) {
  const [images, setImages] = useState<ProductImage[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const load = async () => {
    const res = await fetch(`/api/admin/products/${productId}/images`)
    const data = await res.json() as { images: ProductImage[] }
    setImages(data.images ?? [])
  }

  useEffect(() => { void load() }, [productId])

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setUploading(true)

    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: form })
      const data = await res.json() as { url?: string; error?: string }
      if (!res.ok || !data.url) { setError(data.error ?? 'خطا در آپلود'); setUploading(false); return }

      await fetch(`/api/admin/products/${productId}/images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: data.url }),
      })
      await load()
    } catch {
      setError('خطای شبکه')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const deleteImage = async (imageId: string) => {
    if (!confirm('حذف شود؟')) return
    await fetch(`/api/admin/products/${productId}/images?imageId=${imageId}`, { method: 'DELETE' })
    await load()
  }

  return (
    <div className="bg-white rounded-2xl border border-surface-200 p-6 space-y-4">
      <h3 className="font-bold text-surface-900">تصاویر محصول</h3>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {images.map((img) => (
          <div key={img.id} className="relative group aspect-square rounded-xl overflow-hidden border border-surface-200 bg-surface-50">
            <img src={img.url} alt={img.alt ?? ''} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => deleteImage(img.id)}
              className="absolute top-1 end-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="حذف تصویر"
            >
              ×
            </button>
          </div>
        ))}

        <label className="aspect-square rounded-xl border-2 border-dashed border-surface-300 hover:border-accent-400 cursor-pointer flex flex-col items-center justify-center text-surface-400 hover:text-accent-500 transition-colors">
          {uploading ? (
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <>
              <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-xs">افزودن</span>
            </>
          )}
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={handleFile} disabled={uploading} />
        </label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <p className="text-xs text-surface-400">فرمت‌های مجاز: JPG, PNG, WebP — حداکثر ۵ مگابایت</p>
    </div>
  )
}