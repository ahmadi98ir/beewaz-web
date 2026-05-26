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

function toToman(rial: number) {
  return formatPrice(rial)
}

type GatewayKey = 'zarinpal' | 'idpay' | 'cash_on_delivery'

interface AppliedCoupon {
  code: string
  discountAmount: number
  type: string
  value: string
}

interface CouponValidateResponse {
  valid?: boolean
  error?: string
  coupon?: {
    code: string
    discountAmount: number
    type: string
    value: string
  }
}

interface OrderResponse {
  orderId?: string
  totalAmount?: number
  gateway?: string
  error?: string
}

const GATEWAYS: { key: GatewayKey; label: string; desc: string; icon: React.ReactNode }[] = [
  {
    key: 'zarinpal',
    label: 'زرین‌پال',
    desc: 'پرداخت آنلاین با زرین‌پال',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  },
  {
    key: 'idpay',
    label: 'آیدی‌پی',
    desc: 'پرداخت آنلاین با IDPay',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
      </svg>
    ),
  },
  {
    key: 'cash_on_delivery',
    label: 'پرداخت در محل',
    desc: 'پرداخت هنگام تحویل کالا',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
]

export default function CheckoutClient() {
  const router = useRouter()
  const params = useSearchParams()
  const { data: session, status } = useSession()
  const { items, clearCart } = useCart()

  // ── اطلاعات گیرنده ──────────────────────────────────────────────────────
  const [fullName, setFullName] = useState('')
  const sessionPhone = (session?.user as { phone?: string })?.phone ?? ''

  // ── آدرس ساختاریافته ────────────────────────────────────────────────────
  const [province, setProvince] = useState('')
  const [city, setCity] = useState('')
  const [street, setStreet] = useState('')
  const [alley, setAlley] = useState('')
  const [plaque, setPlaque] = useState('')
  const [unit, setUnit] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [notes, setNotes] = useState('')

  // ── کوپن ──────────────────────────────────────────────────────────────
  const [couponInput, setCouponInput] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState('')
  const [couponApplied, setCouponApplied] = useState<AppliedCoupon | null>(null)

  // ── روش پرداخت ────────────────────────────────────────────────────────
  const [gateway, setGateway] = useState<GatewayKey>('zarinpal')

  const [error, setError] = useState(
    params.get('error') === 'cancelled' ? 'پرداخت لغو شد' :
    params.get('error') === 'payment_failed' ? 'پرداخت ناموفق بود' :
    params.get('error') === 'gateway_error' ? 'خطا در اتصال به درگاه پرداخت' : ''
  )
  const [loading, setLoading] = useState(false)

  // پر کردن نام از session
  useEffect(() => {
    if (session?.user?.name) setFullName(session.user.name)
  }, [session])

  // redirect به login
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
  const discount = couponApplied?.discountAmount ?? 0
  const total = Math.max(0, subtotal + shipping - discount)

  const applyCoupon = async () => {
    const code = couponInput.trim()
    if (!code) return
    setCouponLoading(true)
    setCouponError('')
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, orderAmount: subtotal }),
      })
      const data = await res.json() as CouponValidateResponse
      if (!res.ok || !data.valid || !data.coupon) {
        setCouponError(data.error ?? 'کد تخفیف معتبر نیست')
        setCouponApplied(null)
      } else {
        setCouponApplied({
          code: data.coupon.code,
          discountAmount: data.coupon.discountAmount,
          type: data.coupon.type,
          value: data.coupon.value,
        })
        setCouponError('')
      }
    } catch {
      setCouponError('خطای شبکه. لطفاً دوباره تلاش کنید')
    } finally {
      setCouponLoading(false)
    }
  }

  const removeCoupon = () => {
    setCouponApplied(null)
    setCouponInput('')
    setCouponError('')
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const normalPostal = toEnDigits(postalCode).replace(/\s/g, '')
    if (!/^\d{10}$/.test(normalPostal)) {
      setError('کد پستی باید ۱۰ رقم باشد')
      return
    }

    if (!street.trim()) { setError('خیابان اصلی الزامی است'); return }
    if (!plaque.trim()) { setError('پلاک الزامی است'); return }

    setLoading(true)
    try {
      const paymentMethod = gateway === 'cash_on_delivery' ? 'cash_on_delivery' : 'online'
      const gatewayParam = gateway === 'cash_on_delivery' ? 'zarinpal' : gateway

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
          couponCode: couponApplied?.code || undefined,
          paymentMethod,
          gateway: gatewayParam,
        }),
      })

      const data = await res.json() as OrderResponse
      if (!res.ok || !data.orderId) {
        setError(data.error ?? 'خطا در ثبت سفارش')
        setLoading(false)
        return
      }

      clearCart()

      if (gateway === 'cash_on_delivery') {
        router.push(`/orders/${data.orderId}/confirmation`)
      } else if (gateway === 'idpay') {
        window.location.href = `/api/idpay/request?orderId=${data.orderId}`
      } else {
        window.location.href = `/api/zarinpal/request?orderId=${data.orderId}`
      }
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

                {/* شماره تلفن — از session */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-surface-700 mb-1.5">
                    شماره موبایل
                    <span className="text-xs font-normal text-surface-400 ms-2">(از حساب کاربری شما)</span>
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

            {/* ── کد تخفیف ──────────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-surface-200 p-6 shadow-sm">
              <h2 className="text-base font-bold text-surface-800 mb-4">کد تخفیف</h2>

              {couponApplied ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-sm font-bold text-green-700">کد تخفیف اعمال شد</p>
                    <p className="text-xs text-green-600 mt-0.5">
                      <span className="font-mono font-bold">{couponApplied.code}</span>
                      {' — '}
                      تخفیف {toToman(couponApplied.discountAmount)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-xs text-red-500 hover:text-red-700 font-semibold transition-colors"
                  >
                    حذف
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    value={couponInput}
                    onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError('') }}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), applyCoupon())}
                    placeholder="کد تخفیف را وارد کنید"
                    className="input flex-1 font-mono tracking-widest text-center"
                    dir="ltr"
                    maxLength={50}
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    disabled={couponLoading || !couponInput.trim()}
                    className="btn btn-outline px-5 text-sm flex-shrink-0 disabled:opacity-40"
                  >
                    {couponLoading ? (
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : 'اعمال'}
                  </button>
                </div>
              )}

              {couponError && (
                <p className="text-xs text-red-600 mt-2 font-medium">{couponError}</p>
              )}
            </div>

            {/* ── روش پرداخت ────────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-surface-200 p-6 shadow-sm">
              <h2 className="text-base font-bold text-surface-800 mb-4">روش پرداخت</h2>
              <div className="space-y-2.5">
                {GATEWAYS.map((g) => (
                  <label
                    key={g.key}
                    className={[
                      'flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all',
                      gateway === g.key
                        ? 'border-brand-500 bg-brand-50'
                        : 'border-surface-200 hover:border-surface-300 bg-white',
                    ].join(' ')}
                  >
                    <input
                      type="radio"
                      name="gateway"
                      value={g.key}
                      checked={gateway === g.key}
                      onChange={() => setGateway(g.key)}
                      className="sr-only"
                    />
                    <span className={gateway === g.key ? 'text-brand-600' : 'text-surface-400'}>
                      {g.icon}
                    </span>
                    <div className="flex-1">
                      <p className={`text-sm font-bold ${gateway === g.key ? 'text-brand-700' : 'text-surface-800'}`}>
                        {g.label}
                      </p>
                      <p className="text-xs text-surface-400 mt-0.5">{g.desc}</p>
                    </div>
                    <div className={[
                      'w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center',
                      gateway === g.key ? 'border-brand-500 bg-brand-500' : 'border-surface-300',
                    ].join(' ')}>
                      {gateway === g.key && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>
                  </label>
                ))}
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
                  {gateway === 'cash_on_delivery' ? 'در حال ثبت سفارش...' : 'در حال انتقال به درگاه...'}
                </span>
              ) : (
                gateway === 'cash_on_delivery'
                  ? `ثبت سفارش — ${toToman(total)}`
                  : `پرداخت ${toToman(total)}`
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

                {/* تخفیف کوپن */}
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 font-semibold">
                    <span>تخفیف کوپن</span>
                    <span>− {toToman(discount)}</span>
                  </div>
                )}

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
