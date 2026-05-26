'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useCart } from '@/stores/cart'
import { toEnDigits, toFaDigits, formatPrice } from '@/lib/utils'

// لیست استان‌های ایران
const PROVINCES = [
  'آذربایجان شرقی','آذربایجان غربی','اردبیل','اصفهان','البرز','ایلام',
  'بوشهر','تهران','چهارمحال و بختیاری','خراسان جنوبی','خراسان رضوی',
  'خراسان شمالی','خوزستان','زنجان','سمنان','سیستان و بلوچستان','فارس',
  'قزوین','قم','کردستان','کرمان','کرمانشاه','کهگیلویه و بویراحمد',
  'گلستان','گیلان','لرستان','مازندران','مرکزی','هرمزگان','همدان','یزد',
]

// قیمت را از ریال به تومان تبدیل و نمایش می‌دهد
function toToman(rial: number) {
  return formatPrice(rial)
}

export default function CheckoutClient() {
  const router = useRouter()
  const params = useSearchParams()
  const { data: session, status } = useSession()
  const { items, clearCart } = useCart()

  // ── اطلاعات گیرنده ──────────────────────────────────────────────────────
  const [fullName, setFullName] = useState('')
  // شماره تلفن از session می‌آید — نیازی به فیلد ورودی جداگانه نیست
  const sessionPhone = (session?.user as { phone?: string })?.phone ?? ''

  // ── آدرس ساختاریافته ────────────────────────────────────────────────────
  const [province, setProvince] = useState('')
  const [city, setCity] = useState('')
  const [street, setStreet] = useState('')        // خیابان اصلی
  const [alley, setAlley] = useState('')          // خیابان فرعی (اختیاری)
  const [plaque, setPlaque] = useState('')        // پلاک
  const [unit, setUnit] = useState('')            // واحد (اختیاری)
  const [postalCode, setPostalCode] = useState('')

  const [notes, setNotes] = useState('')
  const [error, setError] = useState(
    params.get('error') === 'cancelled' ? 'پرداخت لغو شد' :
    params.get('error') === 'payment_failed' ? 'پرداخت ناموفق بود' : ''
  )
  const [loading, setLoading] = useState(false)

  // پر کردن نام از session
  useEffect(() => {
    if (session?.user?.name) setFullName(session.user.name)
  }, [session])

  // redirect به login اگر کاربر وارد نشده باشد
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/checkout')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-surface-50 flex flex-col items-center justify-center gap-4 p-4">
        <p className="text-surface-600 text-lg font-semibold">سبد خرید شما خالی است</p>
        <Link href="/shop" className="btn btn-accent px-8">برگشت به فروشگاه</Link>
      </div>
    )
  }

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const shipping = subtotal >= 2_000_000 ? 0 : 150_000
  const total = subtotal + shipping

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // نرمال‌سازی کد پستی (از فارسی به لاتین)
    const normalPostal = toEnDigits(postalCode).replace(/\s/g, '')
    if (!/^\d{10}$/.test(normalPostal)) {
      setError('کد پستی باید ۱۰ رقم باشد')
      return
    }

    if (!street.trim()) { setError('خیابان اصلی الزامی است'); return }
    if (!plaque.trim()) { setError('پلاک الزامی است'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: {
            fullName: fullName.trim(),
            phone: sessionPhone,
            province,
            city,
            street: street.trim(),
            alley: alley.trim() || undefined,
            plaque: plaque.trim(),
            unit: unit.trim() || undefined,
            postalCode: normalPostal,
          },
          items: items.map((i) => ({ id: i.id, quantity: i.quantity })),
          notes: notes.trim() || undefined,
        }),
      })
      const data = await res.json() as { orderId?: string; error?: string }
      if (!res.ok || !data.orderId) {
        setError(data.error ?? 'خطا در ثبت سفارش')
        setLoading(false)
        return
      }
      clearCart()
      router.push(`/api/zarinpal/request?orderId=${data.orderId}`)
    } catch {
      setError('خطای شبکه. لطفاً دوباره تلاش کنید')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-50 py-10">
      <div className="container-main max-w-5xl">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-6">
          <Link href="/" className="text-surface-400 hover:text-brand-600 transition-colors">خانه</Link>
          <span className="text-surface-300">/</span>
          <Link href="/cart" className="text-surface-400 hover:text-brand-600 transition-colors">سبد خرید</Link>
          <span className="text-surface-300">/</span>
          <span className="text-surface-700 font-medium">تکمیل خرید</span>
        </nav>

        <h1 className="text-2xl font-black text-surface-900 mb-8">تکمیل خرید</h1>

        <div className="grid lg:grid-cols-3 gap-8">

          {/* ── فرم اطلاعات ارسال ─────────────────────────────────────────── */}
          <form onSubmit={onSubmit} className="lg:col-span-2 space-y-5">

            {/* اطلاعات گیرنده */}
            <div className="bg-white rounded-2xl border border-surface-200 p-6 shadow-sm">
              <h2 className="text-base font-bold text-surface-800 mb-5 pb-3 border-b border-surface-100">
                اطلاعات گیرنده
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-surface-700 mb-1.5">
                    نام و نام‌خانوادگی گیرنده
                  </label>
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="نام کامل"
                    className="input w-full"
                    required
                    minLength={2}
                  />
                </div>

                {/* شماره تلفن — از حساب کاربری (فقط نمایش) */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-surface-700 mb-1.5">
                    شماره موبایل
                    <span className="text-xs font-normal text-surface-400 ms-2">
                      (از حساب کاربری شما)
                    </span>
                  </label>
                  <div className="input bg-surface-50 text-surface-500 cursor-default flex items-center gap-2">
                    <span className="text-green-500 text-xs">●</span>
                    <span dir="ltr" className="font-mono">
                      {toFaDigits(sessionPhone || '—')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* آدرس ارسال */}
            <div className="bg-white rounded-2xl border border-surface-200 p-6 shadow-sm">
              <h2 className="text-base font-bold text-surface-800 mb-5 pb-3 border-b border-surface-100">
                آدرس ارسال
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">

                {/* استان */}
                <div>
                  <label className="block text-sm font-semibold text-surface-700 mb-1.5">استان</label>
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="input w-full"
                    required
                  >
                    <option value="">انتخاب کنید...</option>
                    {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                {/* شهر */}
                <div>
                  <label className="block text-sm font-semibold text-surface-700 mb-1.5">شهر</label>
                  <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="نام شهر"
                    className="input w-full"
                    required
                    minLength={2}
                  />
                </div>

                {/* خیابان اصلی */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-surface-700 mb-1.5">خیابان اصلی</label>
                  <input
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="مثال: خیابان ولیعصر"
                    className="input w-full"
                    required
                    minLength={2}
                  />
                </div>

                {/* خیابان فرعی */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-surface-700 mb-1.5">
                    خیابان فرعی / کوچه
                    <span className="text-xs font-normal text-surface-400 ms-2">(اختیاری)</span>
                  </label>
                  <input
                    value={alley}
                    onChange={(e) => setAlley(e.target.value)}
                    placeholder="مثال: کوچه گلستان"
                    className="input w-full"
                  />
                </div>

                {/* پلاک */}
                <div>
                  <label className="block text-sm font-semibold text-surface-700 mb-1.5">پلاک</label>
                  <input
                    value={plaque}
                    onChange={(e) => setPlaque(e.target.value)}
                    placeholder="مثال: ۱۲"
                    className="input w-full"
                    required
                  />
                </div>

                {/* واحد */}
                <div>
                  <label className="block text-sm font-semibold text-surface-700 mb-1.5">
                    واحد
                    <span className="text-xs font-normal text-surface-400 ms-2">(اختیاری)</span>
                  </label>
                  <input
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="مثال: ۳"
                    className="input w-full"
                  />
                </div>

                {/* کد پستی */}
                <div>
                  <label className="block text-sm font-semibold text-surface-700 mb-1.5">کد پستی</label>
                  <input
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="۱۰ رقم"
                    dir="ltr"
                    className="input w-full"
                    required
                    inputMode="numeric"
                    maxLength={10}
                  />
                </div>

                {/* توضیحات */}
                <div>
                  <label className="block text-sm font-semibold text-surface-700 mb-1.5">
                    توضیحات
                    <span className="text-xs font-normal text-surface-400 ms-2">(اختیاری)</span>
                  </label>
                  <input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="توضیح خاصی دارید؟"
                    className="input w-full"
                    maxLength={500}
                  />
                </div>

              </div>
            </div>

            {error && (
              <div
                className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 text-center"
                role="alert"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-accent w-full py-3.5 text-base"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  در حال انتقال به درگاه...
                </span>
              ) : (
                `پرداخت ${toToman(total)}`
              )}
            </button>
          </form>

          {/* ── خلاصه سبد خرید ───────────────────────────────────────────── */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-surface-200 p-5 shadow-sm sticky top-24">
              <h2 className="text-base font-bold text-surface-800 mb-4">خلاصه سفارش</h2>

              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm gap-2">
                    <span className="text-surface-700 truncate">
                      {item.nameFa}
                      <span className="text-surface-400 ms-1">×{toFaDigits(item.quantity)}</span>
                    </span>
                    <span className="font-semibold text-surface-900 whitespace-nowrap flex-shrink-0">
                      {toToman(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-surface-100 pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-surface-500">
                  <span>جمع کالاها</span>
                  <span>{toToman(subtotal)}</span>
                </div>
                <div className="flex justify-between text-surface-500">
                  <span>هزینه ارسال</span>
                  {shipping === 0
                    ? <span className="text-green-600 font-semibold">رایگان</span>
                    : <span>{toToman(shipping)}</span>
                  }
                </div>
                <div className="flex justify-between font-bold text-surface-900 pt-2 border-t border-surface-100">
                  <span>قابل پرداخت</span>
                  <span style={{ color: '#F97316' }}>{toToman(total)}</span>
                </div>
              </div>

              {shipping > 0 && (
                <p className="text-xs text-surface-400 mt-3 bg-surface-50 rounded-lg p-2 text-center">
                  خرید بالای {toToman(2_000_000)} — ارسال رایگان
                </p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
