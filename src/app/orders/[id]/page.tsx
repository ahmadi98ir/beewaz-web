'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { formatPrice, toFaDigits } from '@/lib/utils'

interface OrderItem {
  id: string
  productName: string
  variantName: string | null
  sku: string | null
  quantity: number
  unitPrice: string
  totalPrice: string
}

interface Order {
  id: string
  status: string
  totalAmount: string
  shippingAmount: string
  discountAmount: string
  couponCode: string | null
  paymentMethod: string | null
  trackingCode: string | null
  customerNote: string | null
  officialInvoice?: boolean
  taxAmount?: string
  shippingAddress: {
    fullName?: string; phone?: string; province?: string; city?: string
    street?: string; alley?: string; plaque?: string; unit?: string; postalCode?: string
  } | null
  createdAt: string
  paidAt: string | null
  shippedAt: string | null
  deliveredAt: string | null
}

const STATUS_FLOW = [
  { key: 'pending',    label: 'ثبت سفارش',        icon: '📋' },
  { key: 'paid',       label: 'پرداخت شده',        icon: '✅' },
  { key: 'processing', label: 'در حال آماده‌سازی', icon: '📦' },
  { key: 'shipped',    label: 'ارسال شده',         icon: '🚚' },
  { key: 'delivered',  label: 'تحویل شده',         icon: '🏠' },
]

const STATUS_LABELS: Record<string, string> = {
  pending: 'در انتظار پرداخت', paid: 'پرداخت شده',
  processing: 'در حال آماده‌سازی', shipped: 'ارسال شده',
  delivered: 'تحویل شده', cancelled: 'لغو شده', refunded: 'مسترد شده',
}

const PAYMENT_LABELS: Record<string, string> = {
  online: 'درگاه آنلاین', card_to_card: 'کارت به کارت',
  cash_on_delivery: 'پرداخت در محل', installment: 'اقساطی',
}

function fdate(d: string | null) {
  if (!d) return null
  return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(d))
}

function fmt(v: string | number) {
  return formatPrice(typeof v === 'string' ? parseInt(v) : v)
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [items, setItems] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchOrder = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/orders/${id}`)
      if (!res.ok) { setError('سفارش یافت نشد'); return }
      const j = await res.json() as { order: Order; items: OrderItem[] }
      setOrder(j.order)
      setItems(j.items)
    } catch {
      setError('خطا در بارگذاری')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { void fetchOrder() }, [fetchOrder])

  if (loading) return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (error || !order) return (
    <div className="min-h-screen bg-surface-50 flex flex-col items-center justify-center gap-4">
      <p className="text-red-500 font-semibold">{error || 'سفارش یافت نشد'}</p>
      <Link href="/profile" className="btn btn-outline text-sm">بازگشت به پروفایل</Link>
    </div>
  )

  const isCancelled = order.status === 'cancelled' || order.status === 'refunded'
  const currentStep = STATUS_FLOW.findIndex((s) => s.key === order.status)
  const addr = order.shippingAddress

  return (
    <div className="min-h-screen bg-surface-50 py-8">
      <div className="container-main max-w-3xl space-y-5">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/profile" className="p-2 rounded-xl hover:bg-surface-100 text-surface-400 transition-colors">
            <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-black text-surface-900">
              سفارش #{order.id.slice(0, 8).toUpperCase()}
            </h1>
            <p className="text-xs text-surface-400 mt-0.5">{fdate(order.createdAt)}</p>
          </div>
          <span className={`mr-auto text-xs font-bold px-3 py-1.5 rounded-lg border ${
            isCancelled
              ? 'bg-red-50 text-red-600 border-red-200'
              : order.status === 'delivered'
              ? 'bg-green-50 text-green-700 border-green-200'
              : order.status === 'paid'
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
            {STATUS_LABELS[order.status] ?? order.status}
          </span>
        </div>

        {/* Status timeline */}
        {!isCancelled && (
          <div className="bg-white rounded-2xl border border-surface-200 p-5">
            <div className="flex items-center justify-between relative">
              <div className="absolute inset-x-0 top-5 h-0.5 bg-surface-100 mx-8" />
              {STATUS_FLOW.map((step, i) => {
                const done = i <= currentStep
                const active = i === currentStep
                return (
                  <div key={step.key} className="flex flex-col items-center gap-2 flex-1 relative z-10">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all ${
                      done
                        ? active
                          ? 'bg-brand-600 shadow-lg shadow-brand-600/30'
                          : 'bg-green-500'
                        : 'bg-surface-100'
                    }`}>
                      {step.icon}
                    </div>
                    <span className={`text-[10px] font-semibold text-center leading-tight hidden sm:block ${
                      done ? active ? 'text-brand-600' : 'text-green-600' : 'text-surface-400'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Tracking code */}
        {order.trackingCode && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
            <span className="text-2xl">📬</span>
            <div>
              <p className="font-bold text-green-800 text-sm">کد پیگیری مرسوله</p>
              <p className="font-mono text-green-700 text-base tracking-widest mt-0.5" dir="ltr">
                {order.trackingCode}
              </p>
            </div>
          </div>
        )}

        {/* Items */}
        <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-surface-100">
            <h2 className="font-bold text-surface-900">آیتم‌های سفارش</h2>
          </div>
          <div className="divide-y divide-surface-50">
            {items.map((item) => (
              <div key={item.id} className="px-5 py-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-surface-100 flex items-center justify-center text-xl flex-shrink-0">📦</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-surface-900 text-sm truncate">{item.productName}</p>
                  {item.variantName && <p className="text-xs text-surface-400 mt-0.5">{item.variantName}</p>}
                  {item.sku && <p className="text-xs text-surface-300 font-mono">{item.sku}</p>}
                </div>
                <div className="text-end flex-shrink-0">
                  <p className="font-bold text-surface-900 text-sm">{fmt(item.totalPrice)}</p>
                  <p className="text-xs text-surface-400 mt-0.5">
                    {fmt(item.unitPrice)} × {toFaDigits(item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {/* Price summary */}
          <div className="px-5 py-4 bg-surface-50 border-t border-surface-100 space-y-2 text-sm">
            <div className="flex justify-between text-surface-500">
              <span>جمع کالاها</span>
              <span>{fmt(items.reduce((s, i) => s + parseInt(i.totalPrice), 0))}</span>
            </div>
            {order.shippingAmount !== '0' && (
              <div className="flex justify-between text-surface-500">
                <span>هزینه ارسال</span>
                <span>{fmt(order.shippingAmount)}</span>
              </div>
            )}
            {order.discountAmount !== '0' && (
              <div className="flex justify-between text-green-600 font-semibold">
                <span>تخفیف{order.couponCode ? ` (${order.couponCode})` : ''}</span>
                <span>− {fmt(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between font-black text-surface-900 pt-2 border-t border-surface-200">
              <span>قابل پرداخت</span>
              <span className="text-brand-600">{fmt(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Shipping + dates row */}
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Shipping address */}
          {addr && (
            <div className="bg-white rounded-2xl border border-surface-200 p-5">
              <h2 className="font-bold text-surface-900 mb-3 text-sm">آدرس ارسال</h2>
              <div className="text-sm text-surface-600 space-y-1 leading-relaxed">
                <p className="font-semibold">{addr.fullName}</p>
                {addr.phone && <p className="text-surface-400 font-mono text-xs">{toFaDigits(addr.phone)}</p>}
                <p className="mt-2">
                  {addr.province}، {addr.city}
                  {addr.street ? `، ${addr.street}` : ''}
                  {addr.alley ? `، ${addr.alley}` : ''}
                  {addr.plaque ? `، پلاک ${addr.plaque}` : ''}
                  {addr.unit ? `، واحد ${addr.unit}` : ''}
                </p>
                {addr.postalCode && (
                  <p className="text-surface-400 text-xs">کد پستی: {toFaDigits(addr.postalCode)}</p>
                )}
              </div>
            </div>
          )}

          {/* Dates + payment */}
          <div className="bg-white rounded-2xl border border-surface-200 p-5 space-y-3">
            <h2 className="font-bold text-surface-900 text-sm">جزئیات پرداخت</h2>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-surface-400">روش پرداخت</span>
                <span className="font-semibold text-surface-700">
                  {PAYMENT_LABELS[order.paymentMethod ?? ''] ?? '—'}
                </span>
              </div>
              {order.paidAt && (
                <div className="flex justify-between">
                  <span className="text-surface-400">تاریخ پرداخت</span>
                  <span className="font-semibold text-surface-700">{fdate(order.paidAt)}</span>
                </div>
              )}
              {order.shippedAt && (
                <div className="flex justify-between">
                  <span className="text-surface-400">تاریخ ارسال</span>
                  <span className="font-semibold text-surface-700">{fdate(order.shippedAt)}</span>
                </div>
              )}
              {order.deliveredAt && (
                <div className="flex justify-between">
                  <span className="text-surface-400">تاریخ تحویل</span>
                  <span className="font-semibold text-surface-700">{fdate(order.deliveredAt)}</span>
                </div>
              )}
            </div>
            {order.customerNote && (
              <div className="pt-2 border-t border-surface-100">
                <p className="text-xs text-surface-400 mb-1">یادداشت شما</p>
                <p className="text-xs text-surface-600">{order.customerNote}</p>
              </div>
            )}
          </div>
        </div>

        {['paid', 'processing', 'shipped', 'delivered'].includes(order.status) && (
          <Link href={`/orders/${order.id}/invoice`} className="btn btn-outline w-full text-sm py-2.5 mb-3 flex items-center justify-center gap-2">
            📄 دریافت فاکتور رسمی
          </Link>
        )}

        <div className="flex gap-3">
          <Link href="/profile" className="btn btn-outline flex-1 text-sm py-2.5">
            بازگشت به پروفایل
          </Link>
          <Link href="/shop" className="btn btn-primary flex-1 text-sm py-2.5">
            ادامه خرید
          </Link>
        </div>
      </div>
    </div>
  )
}
