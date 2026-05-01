'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/stores/cart'
import { formatPrice } from '@/lib/utils'
import { CheckIcon, ShieldIcon } from '@/components/ui/icons'

type Step = 1 | 2 | 3

type ShippingInfo = {
  fullName: string; phone: string; province: string
  city: string; address: string; postalCode: string
}

const PROVINCES = ['تهران', 'اصفهان', 'فارس', 'خراسان رضوی', 'آذربایجان شرقی', 'البرز', 'مازندران', 'گیلان', 'خوزستان', 'سایر']

function StepIndicator({ current }: { current: Step }) {
  const steps = ['اطلاعات ارسال', 'روش پرداخت', 'تأیید نهایی']
  return (
    <div className="flex items-center gap-0">
      {steps.map((label, i) => {
        const num = (i + 1) as Step
        const done = current > num
        const active = current === num
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${done ? 'bg-green-500 text-white' : active ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30' : 'bg-surface-200 text-surface-500'}`}>
                {done ? <CheckIcon size={16} /> : num}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${active ? 'text-brand-600' : 'text-surface-400'}`}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-0.5 w-12 sm:w-20 mx-2 mb-5 transition-colors ${done ? 'bg-green-400' : 'bg-surface-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal, clearCart } = useCart()
  const [step, setStep] = useState<Step>(1)
  const [paymentMethod, setPaymentMethod] = useState<'zarinpal' | 'idpay'>('zarinpal')
  const [loading, setLoading] = useState(false)
  const [info, setInfo] = useState<ShippingInfo>({
    fullName: '', phone: '', province: 'تهران', city: '', address: '', postalCode: '',
  })

  const shipping = subtotal >= 500_000 ? 0 : 80_000
  const total = subtotal + shipping

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-surface-500 mb-4">سبد خرید شما خالی است.</p>
          <Link href="/shop" className="btn btn-primary">رفتن به فروشگاه</Link>
        </div>
      </div>
    )
  }

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault()
    setStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePlaceOrder = async () => {
    setLoading(true)
    // شبیه‌سازی redirect به درگاه پرداخت
    await new Promise((r) => setTimeout(r, 1500))
    clearCart()
    router.push('/checkout/success')
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <div className="bg-white border-b border-surface-200">
        <div className="container-main py-3">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-surface-500 hover:text-brand-600 transition-colors">خانه</Link>
            <span className="text-surface-300">/</span>
            <Link href="/cart" className="text-surface-500 hover:text-brand-600 transition-colors">سبد خرید</Link>
            <span className="text-surface-300">/</span>
            <span className="text-surface-900 font-medium">پرداخت</span>
          </nav>
        </div>
      </div>

      <div className="container-main py-8">
        <div className="flex flex-col items-center mb-10">
          <h1 className="text-2xl font-black text-surface-900 mb-6">تکمیل سفارش</h1>
          <StepIndicator current={step} />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* فرم */}
          <div className="lg:col-span-2">

            {/* مرحله ۱: اطلاعات ارسال */}
            {step === 1 && (
              <form onSubmit={handleStep1Submit} className="bg-white rounded-3xl border border-surface-200 p-6 lg:p-8 space-y-5">
                <h2 className="text-base font-black text-surface-900 pb-4 border-b border-surface-100">اطلاعات ارسال</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-surface-700 mb-1.5">نام و نام خانوادگی *</label>
                    <input required className="input" value={info.fullName} onChange={e => setInfo(p => ({ ...p, fullName: e.target.value }))} placeholder="علی رضایی" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-surface-700 mb-1.5">شماره موبایل *</label>
                    <input required type="tel" dir="ltr" className="input" value={info.phone} onChange={e => setInfo(p => ({ ...p, phone: e.target.value }))} placeholder="09121234567" pattern="09[0-9]{9}" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-surface-700 mb-1.5">استان *</label>
                    <select required className="input" value={info.province} onChange={e => setInfo(p => ({ ...p, province: e.target.value }))}>
                      {PROVINCES.map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-surface-700 mb-1.5">شهر *</label>
                    <input required className="input" value={info.city} onChange={e => setInfo(p => ({ ...p, city: e.target.value }))} placeholder="تهران" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-surface-700 mb-1.5">آدرس کامل *</label>
                    <textarea required rows={3} className="input resize-none" value={info.address} onChange={e => setInfo(p => ({ ...p, address: e.target.value }))} placeholder="خیابان، کوچه، پلاک، واحد" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-surface-700 mb-1.5">کد پستی *</label>
                    <input required dir="ltr" className="input" value={info.postalCode} onChange={e => setInfo(p => ({ ...p, postalCode: e.target.value }))} placeholder="1234567890" maxLength={10} />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary w-full py-3.5 text-base mt-2">
                  ادامه — انتخاب روش پرداخت
                </button>
              </form>
            )}

            {/* مرحله ۲: روش پرداخت */}
            {step === 2 && (
              <div className="bg-white rounded-3xl border border-surface-200 p-6 lg:p-8 space-y-5">
                <h2 className="text-base font-black text-surface-900 pb-4 border-b border-surface-100">روش پرداخت</h2>
                <div className="space-y-3">
                  {([
                    { id: 'zarinpal', label: 'زرین‌پال', sub: 'پرداخت آنلاین با کارت بانکی', color: '#6366F1' },
                    { id: 'idpay', label: 'آیدی پی', sub: 'پرداخت سریع با کد QR', color: '#10B981' },
                  ] as const).map(({ id, label, sub, color }) => (
                    <label key={id} className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === id ? 'border-brand-600 bg-brand-50/50' : 'border-surface-200 hover:border-surface-300'}`}>
                      <input type="radio" name="payment" value={id} checked={paymentMethod === id} onChange={() => setPaymentMethod(id)} className="sr-only" />
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: color + '20' }}>
                        <ShieldIcon size={18} style={{ color }} />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-surface-900">{label}</p>
                        <p className="text-xs text-surface-500">{sub}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === id ? 'border-brand-600' : 'border-surface-300'}`}>
                        {paymentMethod === id && <div className="w-2.5 h-2.5 rounded-full bg-brand-600" />}
                      </div>
                    </label>
                  ))}
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setStep(1)} className="btn btn-ghost flex-1 py-3">بازگشت</button>
                  <button onClick={() => { setStep(3); window.scrollTo({ top: 0, behavior: 'smooth' }) }} className="btn btn-primary flex-1 py-3">
                    مرحله بعد
                  </button>
                </div>
              </div>
            )}

            {/* مرحله ۳: تأیید نهایی */}
            {step === 3 && (
              <div className="bg-white rounded-3xl border border-surface-200 p-6 lg:p-8 space-y-5">
                <h2 className="text-base font-black text-surface-900 pb-4 border-b border-surface-100">تأیید و ثبت سفارش</h2>
                {/* خلاصه اطلاعات */}
                <div className="bg-surface-50 rounded-2xl p-4 space-y-2 text-sm">
                  <p><span className="text-surface-500">نام: </span><span className="font-semibold">{info.fullName}</span></p>
                  <p><span className="text-surface-500">موبایل: </span><span className="font-semibold" dir="ltr">{info.phone}</span></p>
                  <p><span className="text-surface-500">آدرس: </span><span className="font-semibold">{info.province}، {info.city}، {info.address}</span></p>
                  <p><span className="text-surface-500">درگاه: </span><span className="font-semibold">{paymentMethod === 'zarinpal' ? 'زرین‌پال' : 'آیدی پی'}</span></p>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setStep(2)} className="btn btn-ghost flex-1 py-3">بازگشت</button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="btn btn-primary flex-1 py-3 gap-2 disabled:opacity-70"
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        در حال اتصال به درگاه...
                      </>
                    ) : `پرداخت ${formatPrice(total)}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* خلاصه سفارش */}
          <div>
            <div className="bg-white rounded-3xl border border-surface-200 p-5 sticky top-24">
              <h3 className="text-sm font-black text-surface-900 mb-4 pb-3 border-b border-surface-100">سفارش شما</h3>
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex-shrink-0" style={{ background: `linear-gradient(135deg, ${item.placeholderFrom}, ${item.placeholderTo})` }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-surface-800 line-clamp-1">{item.nameFa}</p>
                      <p className="text-xs text-surface-400">×{item.quantity}</p>
                    </div>
                    <span className="text-xs font-bold text-surface-900 flex-shrink-0">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-surface-100 pt-3 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-surface-500">جمع</span><span className="font-semibold">{formatPrice(subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-surface-500">ارسال</span><span className={shipping === 0 ? 'text-green-600 font-semibold' : 'font-semibold'}>{shipping === 0 ? 'رایگان' : formatPrice(shipping)}</span></div>
                <div className="flex justify-between pt-2 border-t border-surface-100">
                  <span className="font-bold">مجموع</span>
                  <span className="font-black text-brand-600 text-base">{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
