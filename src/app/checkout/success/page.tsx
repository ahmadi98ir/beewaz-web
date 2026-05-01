import Link from 'next/link'
import { CheckIcon, ShieldIcon } from '@/components/ui/icons'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'سفارش ثبت شد' }

export default function SuccessPage() {
  const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-surface-200 p-8 lg:p-12 max-w-lg w-full text-center shadow-sm">

        {/* آیکون موفقیت */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full bg-green-100 animate-ping opacity-30" />
          <div className="relative w-24 h-24 rounded-full bg-green-500 flex items-center justify-center shadow-xl shadow-green-500/30">
            <CheckIcon size={40} className="text-white" />
          </div>
        </div>

        <h1 className="text-2xl font-black text-surface-900 mb-2">سفارش ثبت شد!</h1>
        <p className="text-surface-500 mb-2">با موفقیت پرداخت انجام شد.</p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-100 text-surface-700 text-sm font-mono font-bold mb-6">
          {orderId}
        </div>

        <div className="bg-surface-50 rounded-2xl p-4 text-sm text-surface-600 leading-relaxed mb-8 space-y-2">
          <p>📦 سفارش شما در اسرع وقت آماده ارسال می‌شود.</p>
          <p>📱 از طریق SMS وضعیت ارسال اطلاع‌رسانی می‌شود.</p>
          <p>📞 برای پیگیری: <a href="tel:02100000000" className="font-bold text-brand-600" dir="ltr">021-0000-0000</a></p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/shop" className="btn btn-outline flex-1 py-3">ادامه خرید</Link>
          <Link href="/dashboard/orders" className="btn btn-primary flex-1 py-3">پیگیری سفارش</Link>
        </div>
      </div>
    </div>
  )
}
