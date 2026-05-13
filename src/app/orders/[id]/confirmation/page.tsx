import { notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { orders, orderItems } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'تایید سفارش', robots: { index: false, follow: false } }

function formatPrice(n: number) {
  return new Intl.NumberFormat('fa-IR').format(n)
}

export default async function ConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) notFound()

  const [order] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, id), eq(orders.userId, session.user.id)))
    .limit(1)

  if (!order || order.status === 'pending') notFound()

  const items = await db
    .select({ quantity: orderItems.quantity, unitPrice: orderItems.unitPrice, snapshot: orderItems.snapshot })
    .from(orderItems)
    .where(eq(orderItems.orderId, id))

  const addr = order.shippingAddress

  return (
    <div className="min-h-screen bg-surface-50 py-16">
      <div className="container-main max-w-2xl">
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
            <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-surface-900 mb-2">سفارش شما با موفقیت ثبت شد!</h1>
          {order.paymentRef && (
            <p className="text-sm text-surface-500">کد رهگیری: <span className="font-mono font-bold text-surface-700">{order.paymentRef}</span></p>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-surface-200 p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-base font-bold text-surface-800 mb-3">اقلام سفارش</h2>
            <div className="space-y-2">
              {items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm py-2 border-b border-surface-50 last:border-0">
                  <span className="text-surface-700">{item.snapshot.name} <span className="text-surface-400">x{item.quantity}</span></span>
                  <span className="font-semibold">{formatPrice(item.unitPrice * item.quantity)} ریال</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-bold text-surface-900 pt-3 mt-1 border-t border-surface-200">
              <span>جمع کل</span>
              <span style={{ color: '#F97316' }}>{formatPrice(order.totalAmount)} ریال</span>
            </div>
          </div>

          {addr && (
            <div>
              <h2 className="text-base font-bold text-surface-800 mb-2">آدرس ارسال</h2>
              <p className="text-sm text-surface-600 leading-relaxed">
                {addr.fullName} — {addr.phone}<br />
                {addr.province}، {addr.city}، {addr.address}<br />
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