'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Coupon {
  id: string
  code: string
  type: 'percentage' | 'fixed'
  value: string
  minOrderAmount: string | null
  maxDiscountAmount: string | null
  usageLimit: number | null
  usageCount: number
  perUserLimit: number | null
  expiresAt: string | null
  active: boolean
}

interface FormState {
  code: string
  type: 'percentage' | 'fixed'
  value: string
  minOrderAmount: string
  maxDiscountAmount: string
  usageLimit: string
  perUserLimit: string
  expiresAt: string
  active: boolean
}

export default function EditCouponPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [coupon, setCoupon] = useState<Coupon | null>(null)

  const [form, setForm] = useState<FormState>({
    code: '',
    type: 'percentage',
    value: '',
    minOrderAmount: '',
    maxDiscountAmount: '',
    usageLimit: '',
    perUserLimit: '1',
    expiresAt: '',
    active: true,
  })

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }))

  useEffect(() => {
    const fetchCoupon = async () => {
      try {
        const res = await fetch(`/api/admin/coupons/${id}`)
        if (!res.ok) { setError('کوپن یافت نشد'); return }
        const data = await res.json() as { coupon: Coupon }
        const c = data.coupon
        setCoupon(c)
        setForm({
          code: c.code,
          type: c.type,
          // درصدی: بدون تبدیل | مقداری: DB به ریال → نمایش به تومان (÷۱۰)
          value: c.type === 'fixed' ? String(Math.floor(Number(c.value) / 10)) : c.value,
          // DB stores rial, display toman
          minOrderAmount: c.minOrderAmount ? String(Math.floor(Number(c.minOrderAmount) / 10)) : '',
          maxDiscountAmount: c.maxDiscountAmount ? String(Math.floor(Number(c.maxDiscountAmount) / 10)) : '',
          usageLimit: c.usageLimit ? String(c.usageLimit) : '',
          perUserLimit: c.perUserLimit ? String(c.perUserLimit) : '1',
          expiresAt: c.expiresAt
            ? new Date(c.expiresAt).toISOString().slice(0, 16)
            : '',
          active: c.active,
        })
      } catch {
        setError('خطا در دریافت اطلاعات')
      } finally {
        setLoading(false)
      }
    }
    void fetchCoupon()
  }, [id])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const body: Record<string, unknown> = {
        code: form.code.trim().toUpperCase(),
        type: form.type,
        // درصدی: بدون تبدیل | مقداری: تومان → ریال (×۱۰)
        value: form.type === 'fixed' ? Number(form.value) * 10 : form.value,
        active: form.active,
        perUserLimit: form.perUserLimit ? Number(form.perUserLimit) : 1,
        minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) * 10 : null,
        maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) * 10 : null,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        expiresAt: form.expiresAt || null,
      }

      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json() as { error?: string }
      if (!res.ok) { setError(data.error ?? 'خطا در ذخیره'); return }
      router.push('/admin/coupons')
    } catch {
      setError('خطای شبکه')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error && !coupon) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <p className="text-red-600 font-semibold">{error}</p>
        <Link href="/admin/coupons" className="btn btn-outline">برگشت</Link>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <header className="bg-white border-b border-surface-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/coupons" className="p-2 rounded-xl hover:bg-surface-50 text-surface-400 hover:text-surface-700 transition-colors">
            <svg viewBox="0 0 20 20" className="w-5 h-5" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </Link>
          <div>
            <h1 className="text-lg font-black text-surface-900">ویرایش کوپن</h1>
            <p className="text-xs font-mono text-brand-600 mt-0.5">{coupon?.code}</p>
          </div>
          {coupon && (
            <div className="ms-auto text-xs text-surface-400">
              تا کنون {coupon.usageCount.toLocaleString('fa-IR')} بار استفاده شده
            </div>
          )}
        </div>
      </header>

      <div className="p-6 max-w-2xl">
        <form onSubmit={onSubmit} className="space-y-5">

          <div className="bg-white rounded-2xl border border-surface-200 p-6 shadow-sm space-y-5">
            <h2 className="text-sm font-bold text-surface-700 pb-3 border-b border-surface-100">مشخصات کوپن</h2>

            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-1.5">کد تخفیف <span className="text-red-500">*</span></label>
              <input
                value={form.code}
                onChange={(e) => set('code', e.target.value.toUpperCase())}
                className="input w-full font-mono tracking-widest text-center uppercase"
                dir="ltr"
                required
                maxLength={50}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-surface-700 mb-1.5">نوع تخفیف</label>
                <select value={form.type} onChange={(e) => set('type', e.target.value as 'percentage' | 'fixed')} className="input w-full" required>
                  <option value="percentage">درصدی (%)</option>
                  <option value="fixed">مقداری (تومان)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-surface-700 mb-1.5">
                  {form.type === 'percentage' ? 'درصد تخفیف' : 'مقدار تخفیف (تومان)'}
                </label>
                <input
                  type="number"
                  value={form.value}
                  onChange={(e) => set('value', e.target.value)}
                  className="input w-full"
                  dir="ltr"
                  min="0"
                  max={form.type === 'percentage' ? '100' : undefined}
                  required
                />
              </div>
            </div>

            {form.type === 'percentage' && (
              <div>
                <label className="block text-sm font-semibold text-surface-700 mb-1.5">
                  حداکثر مبلغ تخفیف (تومان)
                  <span className="text-xs font-normal text-surface-400 ms-2">(اختیاری)</span>
                </label>
                <input
                  type="number"
                  value={form.maxDiscountAmount}
                  onChange={(e) => set('maxDiscountAmount', e.target.value)}
                  className="input w-full"
                  dir="ltr"
                  min="0"
                />
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-surface-200 p-6 shadow-sm space-y-5">
            <h2 className="text-sm font-bold text-surface-700 pb-3 border-b border-surface-100">محدودیت‌ها</h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-surface-700 mb-1.5">
                  حداقل مبلغ سفارش (تومان)
                  <span className="text-xs font-normal text-surface-400 ms-2">(اختیاری)</span>
                </label>
                <input
                  type="number"
                  value={form.minOrderAmount}
                  onChange={(e) => set('minOrderAmount', e.target.value)}
                  className="input w-full"
                  dir="ltr"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-surface-700 mb-1.5">
                  تعداد کل استفاده
                  <span className="text-xs font-normal text-surface-400 ms-2">(اختیاری)</span>
                </label>
                <input
                  type="number"
                  value={form.usageLimit}
                  onChange={(e) => set('usageLimit', e.target.value)}
                  placeholder="بدون محدودیت"
                  className="input w-full"
                  dir="ltr"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-surface-700 mb-1.5">استفاده برای هر کاربر</label>
                <input
                  type="number"
                  value={form.perUserLimit}
                  onChange={(e) => set('perUserLimit', e.target.value)}
                  className="input w-full"
                  dir="ltr"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-surface-700 mb-1.5">
                  تاریخ انقضا
                  <span className="text-xs font-normal text-surface-400 ms-2">(اختیاری)</span>
                </label>
                <input
                  type="datetime-local"
                  value={form.expiresAt}
                  onChange={(e) => set('expiresAt', e.target.value)}
                  className="input w-full"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => set('active', !form.active)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${form.active ? 'bg-brand-600' : 'bg-surface-200'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${form.active ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
              <span className="text-sm font-semibold text-surface-700">
                {form.active ? 'کوپن فعال است' : 'کوپن غیرفعال است'}
              </span>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="btn btn-accent px-8 py-2.5 flex-1">
              {saving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
            </button>
            <Link href="/admin/coupons" className="btn btn-outline px-6 py-2.5">انصراف</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
