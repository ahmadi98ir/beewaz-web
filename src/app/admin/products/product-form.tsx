'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Category {
  id: string
  nameFa: string
}

export interface ProductFormData {
  id?: string
  categoryId?: string | null
  sku: string
  nameFa: string
  nameEn?: string | null
  slug: string
  descriptionFa?: string | null
  price: number
  comparePrice?: number | null
  stock: number
  status: 'draft' | 'active' | 'archived'
  isFeatured: boolean
  metaTitle?: string | null
  metaDesc?: string | null
}

interface Props {
  initial?: Partial<ProductFormData>
  mode: 'create' | 'edit'
}

export function ProductForm({ initial, mode }: Props) {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState<ProductFormData>({
    sku: '',
    nameFa: '',
    nameEn: '',
    slug: '',
    descriptionFa: '',
    price: 0,
    comparePrice: null,
    stock: 0,
    status: 'draft',
    isFeatured: false,
    categoryId: null,
    metaTitle: '',
    metaDesc: '',
    ...initial,
  })

  useEffect(() => {
    fetch('/api/admin/categories')
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []))
      .catch(() => setCategories([]))
  }, [])

  const update = <K extends keyof ProductFormData>(k: K, v: ProductFormData[K]) => {
    setForm((p) => ({ ...p, [k]: v }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)

    try {
      const url = mode === 'create' ? '/api/admin/products' : `/api/admin/products/${form.id}`
      const method = mode === 'create' ? 'POST' : 'PUT'

      const payload = {
        ...form,
        nameEn: form.nameEn || null,
        descriptionFa: form.descriptionFa || null,
        comparePrice: form.comparePrice || null,
        categoryId: form.categoryId || null,
        metaTitle: form.metaTitle || null,
        metaDesc: form.metaDesc || null,
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'خطا رخ داد')
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/admin/products')
        router.refresh()
      }, 800)
    } catch (err) {
      setError('خطا در ارتباط با سرور')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!form.id || !confirm('آیا از حذف این محصول مطمئن هستید؟')) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/products/${form.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'خطا در حذف')
        return
      }
      router.push('/admin/products')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <header className="bg-white border-b border-surface-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black text-surface-900">
            {mode === 'create' ? 'افزودن محصول جدید' : 'ویرایش محصول'}
          </h1>
          <p className="text-xs text-surface-400 mt-0.5">
            {mode === 'create' ? 'محصول را تکمیل و ذخیره کنید' : form.nameFa}
          </p>
        </div>
        <Link href="/admin/products" className="text-sm text-surface-500 hover:text-surface-700">
          ← بازگشت
        </Link>
      </header>

      <form onSubmit={handleSubmit} className="p-6 max-w-4xl space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-2xl border border-surface-200 p-6 space-y-4">
          <h3 className="font-bold text-surface-900">اطلاعات اصلی</h3>

          <div className="grid md:grid-cols-2 gap-4">
            <Field label="نام محصول (فارسی) *">
              <input
                required
                type="text"
                value={form.nameFa}
                onChange={(e) => update('nameFa', e.target.value)}
                className="input w-full"
              />
            </Field>

            <Field label="نام محصول (انگلیسی)">
              <input
                type="text"
                value={form.nameEn || ''}
                onChange={(e) => update('nameEn', e.target.value)}
                dir="ltr"
                className="input w-full"
              />
            </Field>

            <Field label="SKU (کد محصول) *">
              <input
                required
                type="text"
                value={form.sku}
                onChange={(e) => update('sku', e.target.value.toUpperCase())}
                placeholder="BW-001"
                dir="ltr"
                className="input w-full font-mono"
              />
            </Field>

            <Field label="Slug (شناسه URL) *">
              <input
                required
                type="text"
                value={form.slug}
                onChange={(e) => update('slug', e.target.value.toLowerCase())}
                placeholder="motion-sensor-pro"
                dir="ltr"
                className="input w-full font-mono"
              />
            </Field>

            <Field label="دسته‌بندی">
              <select
                value={form.categoryId || ''}
                onChange={(e) => update('categoryId', e.target.value || null)}
                className="input w-full"
              >
                <option value="">— انتخاب کنید —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.nameFa}</option>
                ))}
              </select>
            </Field>

            <Field label="وضعیت">
              <select
                value={form.status}
                onChange={(e) => update('status', e.target.value as ProductFormData['status'])}
                className="input w-full"
              >
                <option value="draft">پیش‌نویس</option>
                <option value="active">فعال</option>
                <option value="archived">آرشیو</option>
              </select>
            </Field>
          </div>

          <Field label="توضیحات">
            <textarea
              value={form.descriptionFa || ''}
              onChange={(e) => update('descriptionFa', e.target.value)}
              rows={4}
              className="input w-full resize-none"
            />
          </Field>
        </div>

        {/* Pricing & Stock */}
        <div className="bg-white rounded-2xl border border-surface-200 p-6 space-y-4">
          <h3 className="font-bold text-surface-900">قیمت و موجودی</h3>

          <div className="grid md:grid-cols-3 gap-4">
            <Field label="قیمت (تومان) *">
              <input
                required
                type="number"
                min={0}
                value={form.price}
                onChange={(e) => update('price', Number(e.target.value))}
                className="input w-full"
              />
            </Field>

            <Field label="قیمت اصلی (پیش از تخفیف)">
              <input
                type="number"
                min={0}
                value={form.comparePrice || ''}
                onChange={(e) => update('comparePrice', e.target.value ? Number(e.target.value) : null)}
                className="input w-full"
              />
            </Field>

            <Field label="موجودی انبار">
              <input
                type="number"
                min={0}
                value={form.stock}
                onChange={(e) => update('stock', Number(e.target.value))}
                className="input w-full"
              />
            </Field>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => update('isFeatured', e.target.checked)}
              className="w-4 h-4 accent-brand-600"
            />
            <span className="text-sm font-medium text-surface-700">محصول ویژه (نمایش در صفحه اصلی)</span>
          </label>
        </div>

        {/* SEO */}
        <div className="bg-white rounded-2xl border border-surface-200 p-6 space-y-4">
          <h3 className="font-bold text-surface-900">تنظیمات SEO</h3>

          <Field label="عنوان متا (Meta Title)">
            <input
              type="text"
              value={form.metaTitle || ''}
              onChange={(e) => update('metaTitle', e.target.value)}
              className="input w-full"
            />
          </Field>

          <Field label="توضیح متا (Meta Description)">
            <textarea
              value={form.metaDesc || ''}
              onChange={(e) => update('metaDesc', e.target.value)}
              rows={2}
              className="input w-full resize-none"
            />
          </Field>
        </div>

        {/* Errors / Success */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700">
            ✓ با موفقیت ذخیره شد
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button type="submit" disabled={loading} className="btn btn-primary py-2.5 px-6">
            {loading ? 'در حال ذخیره...' : mode === 'create' ? 'ایجاد محصول' : 'ذخیره تغییرات'}
          </button>
          <Link href="/admin/products" className="btn btn-outline py-2.5 px-6">
            انصراف
          </Link>
          {mode === 'edit' && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="ms-auto text-sm font-semibold text-red-600 hover:text-red-700 px-4 py-2 rounded-xl hover:bg-red-50 transition-colors"
            >
              حذف محصول
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-surface-700 mb-1.5">{label}</label>
      {children}
    </div>
  )
}
