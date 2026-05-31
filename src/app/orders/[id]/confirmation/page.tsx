import { notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { orders, orderItems, siteSettings } from '@/lib/db/schema'
import { eq, and, inArray } from 'drizzle-orm'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'تایید سفارش', robots: { index: false, follow: false } }

function fmtToman(n: number | string) {
  const num = typeof n === 'string' ? parseInt(n, 10) : n
  const toman = Math.floor(isNaN(num) ? 0 : num / 10)
  return toman.toLocaleString('fa-IR')
}

async function getBankCard() {
  try {
    const rows = await db.select().from(siteSettings).where(
      inArray(siteSettings.key, ['bank_card_number', 'bank_card_holder', 'bank_card_bank'])
    )
    const m: Record<string, string> = {}
    for (const r of rows) { if (r.key) m[r.key] = r.value ?? '' }
    return { number: m['bank_card_number'] ?? '', holder: m['bank_card_holder'] ?? '', bank: m['bank_card_bank'] ?? '' }
  } catch {
    return { number: '', holder: '', bank: '' }
  }
}

export default async function ConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) notFound()

  const isAdmin = session.user.id === 'admin-env'
  const [order] = await db
    .select()
    .from(orders)
    .where(isAdmin ? eq(orders.id, id) : and(eq(orders.id, id), eq(orders.userId, session.user.id)))
    .limit(1)

  // برای پرداخت آنلاین بدون تأیید: notFound (باید از مسیر پرداخت بیاید)
  if (!order) notFound()
  if (order.paymentMethod === 'online' && order.status === 'pending') notFound()

  const [itemsResult, bankCard] = await Promise.all([
    db.select({
      quantity: orderItems.quantity,
      totalPrice: orderItems.totalPrice,
      productName: orderItems.productName,
    }).from(orderItems).where(eq(orderItems.orderId, id)),
    order.paymentMethod === 'card_to_card' ? getBankCard() : Promise.resolve(null),
  ])

  const addr = order.shippingAddress
  const isCardToCard = order.paymentMethod === 'card_to_card'
  const isCashOnDelivery = order.paymentMethod === 'cash_on_delivery'

  return (
    <div className="min-h-screen bg-surface-50 py-16">
      <div className="container-main max-w-2xl">

        {/* هدر */}
        <div className="text-center mb-10">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 ${isCardToCard ? 'bg-amber-100' : 'bg-green-100'}`}>
            {isCardToCard ? (
              <svg className="w-10 h-10 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            ) : (
              <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <h1 className="text-2xl font-black text-surface-900 mb-2">
            {isCardToCard ? 'سفارش ثبت شد — در انتظار پرداخت' : 'سفارش شما با موفقیت ثبت شد!'}
          </h1>
          <p className="text-sm text-surface-500">
            شماره سفارش: <span className="font-mono font-bold text-surface-700">#{id.slice(0, 8).toUpperCase()}</span>
          </p>
        </div>

        {/* اطلاعات کارت به کارت */}
        {isCardToCard && bankCard && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 shadow-sm mb-5">
            <h2 className="text-base font-bold text-amber-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              جهت پرداخت واریز کنید
            </h2>
            <div className="space-y-3">
              {bankCard.number && (
                <div className="bg-white rounded-xl p-4 flex items-center justify-between">
                  <span className="text-xs text-surface-500 font-semibold">شماره کارت</span>
                  <span className="font-mono text-lg font-black text-surface-900 tracking-widest" dir="ltr">
                    {bankCard.number.replace(/(.{4})/g, '$1 ').trim()}
                  </span>
                </div>
              )}
              {bankCard.holder && (
                <div className="bg-white rounded-xl p-3 flex items-center justify-between text-sm">
                  <span className="text-surface-500">صاحب حساب</span>
                  <span className="font-bold text-surface-800">{bankCard.holder}</span>
                </div>
              )}
              {bankCard.bank && (
                <div className="bg-white rounded-xl p-3 flex items-center justify-between text-sm">
                  <span className="text-surface-500">بانک</span>
                  <span className="font-bold text-surface-800">{bankCard.bank}</span>
                </div>
              )}
              <div className="bg-white rounded-xl p-3 flex items-center justify-between text-sm">
                <span className="text-surface-500">مبلغ قابل واریز</span>
                <span className="font-black text-lg text-brand-700">{fmtToman(order.totalAmount)} تومان</span>
              </div>
            </div>
            <p className="text-xs text-amber-700 mt-4 bg-amber-100 rounded-lg p-3">
              پس از واریز، ادمین سفارش شما را تأیید خواهد کرد. در صورت نیاز با پشتیبانی تماس بگیرید.
            </p>
          </div>
        )}

        {/* جزئیات سفارش */}
        <div className="bg-white rounded-2xl border border-surface-200 p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-base font-bold text-surface-800 mb-3">اقلام سفارش</h2>
            <div className="space-y-2">
              {itemsResult.map((item, i) => (
                <div key={i} className="flex justify-between text-sm py-2 border-b border-surface-50 last:border-0">
                  <span className="text-surface-700">
                    {item.productName} <span className="text-surface-400">×{item.quantity}</span>
                  </span>
                  <span className="font-semibold">{fmtToman(item.totalPrice ?? 0)} تومان</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-bold text-surface-900 pt-3 mt-1 border-t border-surface-200">
              <span>قابل پرداخت</span>
              <span style={{ color: '#F97316' }}>{fmtToman(order.totalAmount)} تومان</span>
            </div>
          </div>

          {/* روش پرداخت */}
          <div>
            <h2 className="text-base font-bold text-surface-800 mb-2">روش پرداخت</h2>
            <span className={`inline-flex px-3 py-1.5 rounded-xl text-sm font-semibold border ${
              isCashOnDelivery ? 'bg-blue-50 text-blue-700 border-blue-200' :
              isCardToCard ? 'bg-amber-50 text-amber-700 border-amber-200' :
              'bg-green-50 text-green-700 border-green-200'
            }`}>
              {isCashOnDelivery ? '💵 پرداخت در محل' : isCardToCard ? '🏦 کارت به کارت' : '💳 پرداخت آنلاین'}
            </span>
          </div>

          {addr && (
            <div>
              <h2 className="text-base font-bold text-surface-800 mb-2">آدرس ارسال</h2>
              <p className="text-sm text-surface-600 leading-relaxed">
                {addr.fullName} — {addr.phone}<br />
                {addr.province}، {addr.city}، {addr.street}
                {addr.alley ? `، ${addr.alley}` : ''}، پلاک {addr.plaque}
                {addr.unit ? `، واحد ${addr.unit}` : ''}<br />
                کد پستی: {addr.postalCode}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-8 justify-center">
          <Link href="/profile" className="btn btn-accent px-8">پیگیری سفارشات</Link>
          <Link href="/shop" className="btn border border-surface-300 text-surface-700 hover:bg-surface-100 px-8">ادامه خرید</Link>
        </div>
      </div>
    </div>
  )
}
