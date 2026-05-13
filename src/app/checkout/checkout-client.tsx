'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useCart } from '@/stores/cart'

const PROVINCES = [
  'تهران','اصفهان','فارس','خراسان رضوی','مازندران','گیلان','آذربایجان شرقی',
  'آذربایجان غربی','کرمانشاه','سیستان و بلوچستان','البرز','خوزستان','کرمان',
  'گلستان','همدان','مرکزی','قزوین','اردبیل','سمنان','زنجان','لرستان',
  'خراسان شمالی','خراسان جنوبی','بوشهر','چهارمحال و بختیاری','کهگیلویه و بویراحمد',
  'ایلام','یزد','قم','خراسان','هرمزگان','گلستان',
]

function formatPrice(n: number) {
  return new Intl.NumberFormat('fa-IR').format(n)
}

export default function CheckoutClient() {
  const router = useRouter()
  const params = useSearchParams()
  const { data: session, status } = useSession()
  const { items, clearCart } = useCart()

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [province, setProvince] = useState('')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState(params.get('error') === 'cancelled' ? 'پرداخت لغو شد' : params.get('error') === 'payment_failed' ? 'پرداخت ناموفق بود' : '')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/checkout')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user?.name) setFullName(session.user.name)
  }, [session])

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>
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

    const normalPhone = phone
      .replace(/[۰-۹]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0x06f0 + 0x30))
      .replace(/\s|-/g, '')
      .replace(/^\+98/, '0').replace(/^98/, '0')

    if (!/^09\d{9}$/.test(normalPhone)) {
      setError('شماره موبایل معتبر نیست')
      return
    }
    if (!/^\d{10}$/.test(postalCode)) {
      setError('کد پستی باید ۱۰ رقم باشد')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: { fullName, phone: normalPhone, province, city, address, postalCode },
          items: items.map((i) => ({ id: i.id, quantity: i.quantity })),
          notes: notes || undefined,
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
        <h1 className="text-2xl font-black text-surface-900 mb-8">تکمیل خرید</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* فرم آدرس */}
          <form onSubmit={onSubmit} className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-2xl border border-surface-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-surface-800 mb-5">اطلاعات ارسال</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-surface-700 mb-1.5">نام و نام خانوادگی</label>
                  <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="input w-full" required minLength={2} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-surface-700 mb-1.5">شماره موبایل</label>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09..." dir="ltr" className="input w-full" required inputMode="numeric" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-surface-700 mb-1.5">استان</label>
                  <select value={province} onChange={(e) => setProvince(e.target.value)} className="input w-full" required>
                    <option value="">انتخاب استان</option>
                    {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-surface-700 mb-1.5">شهر</label>
                  <input value={city} onChange={(e) => setCity(e.target.value)} className="input w-full" required minLength={2} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-surface-700 mb-1.5">آدرس کامل</label>
                  <textarea value={address} onChange={(e) => setAddress(e.target.value)} className="input w-full h-20 resize-none" required minLength={5} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-surface-700 mb-1.5">کد پستی</label>
                  <input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="۱۰ رقم" dir="ltr" className="input w-full" required inputMode="numeric" maxLength={10} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-surface-700 mb-1.5">توضیحات (اختیاری)</label>
                  <input value={notes} onChange={(e) => setNotes(e.target.value)} className="input w-full" maxLength={500} />
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 text-center" role="alert">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn btn-accent w-full py-3.5 text-base">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  در حال انتقال به درگاه...
                </span>
              ) : `پرداخت ${formatPrice(total)} ریال`}
            </button>
          </form>

          {/* خلاصه سبد */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-surface-200 p-5 shadow-sm">
              <h2 className="text-base font-bold text-surface-800 mb-4">سبد خرید</h2>
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-surface-700 truncate ml-2">{item.nameFa} <span className="text-surface-400">×{item.quantity}</span></span>
                    <span className="font-semibold text-surface-900 whitespace-nowrap">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-surface-100 pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-surface-500">
                  <span>جمع کالاها</span>
                  <span>{formatPrice(subtotal)} ریال</span>
                </div>
                <div className="flex justify-between text-surface-500">
                  <span>هزینه ارسال</span>
                  <span>{shipping === 0 ? <span className="text-green-600 font-semibold">رایگان</span> : `${formatPrice(shipping)} ریال`}</span>
                </div>
                <div className="flex justify-between font-bold text-surface-900 pt-1 border-t border-surface-100">
                  <span>مبلغ قابل پرداخت</span>
                  <span style={{ color: '#F97316' }}>{formatPrice(total)} ریال</span>
                </div>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-surface-400 mt-3">خرید بالای ۲,۰۰۰,۰۰۰ ریال ارسال رایگان</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
