'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface Product {
  id: string; slug: string; name: string; modelCode: string | null; sku: string | null
  shortDescription: string | null; description: string | null; status: string
  basePrice: string | null; compareAtPrice: string | null; isFeatured: boolean
  warrantyMonths: number; metaTitle: string | null; metaDescription: string | null
  highlights: string[]; categoryId: string | null
}
interface ProductImage { id: string; url: string; alt: string | null; isPrimary: boolean; position: number }

const STATUS_OPTS = [
  { value: 'draft', label: 'پیش‌نویس' }, { value: 'active', label: 'فعال' },
  { value: 'archived', label: 'آرشیو' }, { value: 'out_of_stock', label: 'ناموجود' },
]

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [images, setImages] = useState<ProductImage[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const [tab, setTab] = useState<'basic'|'content'|'seo'|'images'>('basic')
  const [form, setForm] = useState<Partial<Product>>({})

  const fetchProduct = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/admin/products/${id}`)
    const j = await res.json() as { product: Product; images: ProductImage[] }
    setProduct(j.product); setImages(j.images); setForm(j.product)
    setLoading(false)
  }, [id])

  useEffect(() => { fetchProduct() }, [fetchProduct])

  const save = async () => {
    setSaving(true)
    const payload = { ...form }
    if (payload.basePrice) payload.basePrice = String(parseInt(String(payload.basePrice)) * 10)
    if (payload.compareAtPrice) payload.compareAtPrice = String(parseInt(String(payload.compareAtPrice)) * 10)
    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const j = await res.json() as { product: Product }
    setProduct(j.product); setForm(j.product)
    setSaving(false); setToast('ذخیره شد'); setTimeout(() => setToast(''), 2500)
  }

  const f = (k: keyof Product) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  const inputCls = "w-full px-3.5 py-2.5 text-sm border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-300"

  if (loading || !product) return (
    <div className="flex-1 flex items-center justify-center text-surface-300">بارگذاری...</div>
  )

  return (
    <div className="flex-1 overflow-y-auto">
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold">
          ✅ {toast}
        </div>
      )}

      <header className="bg-white border-b border-surface-200 px-6 py-4 flex items-center gap-4">
        <Link href="/admin/products" className="p-2 rounded-xl hover:bg-surface-100 text-surface-400">
          <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </Link>
        <div className="flex-1">
          <h1 className="text-lg font-black text-surface-900">{product.name}</h1>
          <p className="text-xs text-surface-400 font-mono mt-0.5">{product.slug}</p>
        </div>
        <a href={`/shop/${product.slug}`} target="_blank" className="btn btn-outline text-sm py-2 px-4 flex items-center gap-1.5">
          <svg viewBox="0 0 20 20" className="w-3.5 h-3.5" fill="currentColor">
            <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/><path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"/>
          </svg>
          مشاهده در سایت
        </a>
        <button onClick={save} disabled={saving} className="btn btn-primary text-sm py-2.5 px-5 disabled:opacity-50">
          {saving ? 'ذخیره...' : 'ذخیره'}
        </button>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-surface-100 px-6">
        <div className="flex gap-0">
          {([['basic','اطلاعات پایه'],['content','محتوا'],['seo','SEO'],['images','تصاویر']] as const).map(([k,l]) => (
            <button key={k} onClick={() => setTab(k)}
              className={`px-5 py-3.5 text-sm font-semibold border-b-2 transition-all ${tab === k ? 'border-brand-500 text-brand-600' : 'border-transparent text-surface-500 hover:text-surface-700'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 max-w-3xl mx-auto space-y-5">
        {tab === 'basic' && (
          <>
            <div className="bg-white rounded-2xl border border-surface-200 p-6 space-y-4">
              <h3 className="font-bold text-surface-900">اطلاعات پایه</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-surface-600 mb-1.5">نام محصول</label>
                  <input value={form.name ?? ''} onChange={f('name')} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-surface-600 mb-1.5">Slug</label>
                  <input value={form.slug ?? ''} onChange={f('slug')} className={inputCls} dir="ltr" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-surface-600 mb-1.5">کد مدل</label>
                  <input value={form.modelCode ?? ''} onChange={f('modelCode')} className={inputCls} dir="ltr" placeholder="BH10" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-surface-600 mb-1.5">قیمت پایه (تومان)</label>
                  <input type="number" value={form.basePrice ? Math.round(parseInt(String(form.basePrice))/10) : ''} onChange={f('basePrice')} className={inputCls} dir="ltr" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-surface-600 mb-1.5">قیمت قبل از تخفیف (تومان)</label>
                  <input type="number" value={form.compareAtPrice ? Math.round(parseInt(String(form.compareAtPrice))/10) : ''} onChange={f('compareAtPrice')} className={inputCls} dir="ltr" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-surface-600 mb-1.5">وضعیت</label>
                  <select value={form.status ?? 'draft'} onChange={f('status')} className={`${inputCls} bg-white`}>
                    {STATUS_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-surface-600 mb-1.5">گارانتی (ماه)</label>
                  <input type="number" value={form.warrantyMonths ?? 18} onChange={f('warrantyMonths')} className={inputCls} dir="ltr" />
                </div>
                <div className="col-span-2 flex items-center gap-3 p-3 rounded-xl bg-surface-50 border border-surface-100">
                  <button onClick={() => setForm(p => ({ ...p, isFeatured: !p.isFeatured }))}
                    className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${form.isFeatured ? 'bg-brand-500' : 'bg-surface-200'}`}>
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.isFeatured ? 'right-1' : 'left-1'}`} />
                  </button>
                  <div>
                    <p className="text-sm font-semibold text-surface-900">نمایش در صفحه اصلی</p>
                    <p className="text-xs text-surface-400">محصول در بخش «محصولات ویژه» سایت نمایش داده می‌شود</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {tab === 'content' && (
          <div className="bg-white rounded-2xl border border-surface-200 p-6 space-y-4">
            <h3 className="font-bold text-surface-900">محتوای محصول</h3>
            <div>
              <label className="block text-xs font-semibold text-surface-600 mb-1.5">توضیح کوتاه (نمایش در لیست)</label>
              <textarea value={form.shortDescription ?? ''} onChange={f('shortDescription')} rows={2}
                className={`${inputCls} resize-none`} placeholder="توضیح یک‌خطی برای نمایش در کارت محصول..." />
            </div>
            <div>
              <label className="block text-xs font-semibold text-surface-600 mb-1.5">توضیحات کامل (HTML/Markdown)</label>
              <textarea value={form.description ?? ''} onChange={f('description')} rows={12}
                className={`${inputCls} resize-y font-mono text-xs`} placeholder="<p>توضیحات کامل محصول...</p>" />
            </div>
          </div>
        )}

        {tab === 'seo' && (
          <div className="bg-white rounded-2xl border border-surface-200 p-6 space-y-4">
            <h3 className="font-bold text-surface-900">بهینه‌سازی موتور جستجو</h3>
            <div>
              <label className="block text-xs font-semibold text-surface-600 mb-1.5">عنوان SEO</label>
              <input value={form.metaTitle ?? ''} onChange={f('metaTitle')} className={inputCls}
                placeholder={`${product.name} | بیواز`} />
              <p className="text-xs text-surface-400 mt-1">{(form.metaTitle?.length ?? 0)} / 60 کاراکتر</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-surface-600 mb-1.5">توضیح متا</label>
              <textarea value={form.metaDescription ?? ''} onChange={f('metaDescription')} rows={3}
                className={`${inputCls} resize-none`} placeholder="توضیح کوتاه برای نمایش در نتایج گوگل..." />
              <p className="text-xs text-surface-400 mt-1">{(form.metaDescription?.length ?? 0)} / 160 کاراکتر</p>
            </div>
            {/* Preview */}
            <div className="border border-surface-200 rounded-xl p-4 bg-surface-50">
              <p className="text-xs font-semibold text-surface-400 mb-2">پیش‌نمایش گوگل</p>
              <p className="text-blue-600 text-sm font-medium truncate">{form.metaTitle || product.name}</p>
              <p className="text-green-700 text-xs">bz360.ir/shop/{product.slug}</p>
              <p className="text-surface-600 text-xs mt-1 line-clamp-2">{form.metaDescription || product.shortDescription || 'بدون توضیح'}</p>
            </div>
          </div>
        )}

        {tab === 'images' && (
          <div className="bg-white rounded-2xl border border-surface-200 p-6">
            <h3 className="font-bold text-surface-900 mb-4">تصاویر محصول</h3>
            {images.length === 0 ? (
              <div className="border-2 border-dashed border-surface-200 rounded-2xl p-12 text-center">
                <p className="text-surface-400 font-semibold mb-2">تصویری موجود نیست</p>
                <p className="text-surface-300 text-sm">برای آپلود تصویر از طریق فرم زیر اقدام کنید</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-3">
                {images.map(img => (
                  <div key={img.id} className={`relative rounded-xl overflow-hidden aspect-square border-2 ${img.isPrimary ? 'border-brand-400' : 'border-surface-100'}`}>
                    <img src={img.url} alt={img.alt ?? ''} className="w-full h-full object-cover" />
                    {img.isPrimary && <span className="absolute top-1 right-1 text-[10px] bg-brand-500 text-white px-1.5 py-0.5 rounded-full">اصلی</span>}
                  </div>
                ))}
              </div>
            )}
            <div className="mt-5 p-4 bg-surface-50 rounded-xl border border-surface-100">
              <p className="text-xs font-semibold text-surface-500 mb-2">افزودن تصویر از URL</p>
              <div className="flex gap-2">
                <input type="url" placeholder="https://..." className={`${inputCls} flex-1`} dir="ltr" id="img-url" />
                <button onClick={async () => {
                  const url = (document.getElementById('img-url') as HTMLInputElement).value
                  if (!url) return
                  await fetch(`/api/admin/products/${id}`, {
                    method: 'PUT', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ imageUrl: url }),
                  })
                  fetchProduct()
                }} className="btn btn-outline text-sm py-2.5 px-4 flex-shrink-0">افزودن</button>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button onClick={save} disabled={saving} className="btn btn-primary py-3 px-8 disabled:opacity-50 text-sm">
            {saving ? 'در حال ذخیره...' : '✓ ذخیره همه تغییرات'}
          </button>
        </div>
      </div>
    </div>
  )
}
