'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'

type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'

interface OrderItem {
  id: string
  productId: string | null
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

interface Order {
  id: string
  status: OrderStatus
  totalAmount: number
  shippingCost: number | null
  paymentMethod: string | null
  paymentRef: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  shippingAddress: {
    fullName: string
    phone: string
    province: string
    city: string
    address: string
    postalCode: string
  } | null
  items: OrderItem[]
  user: { id: string; fullName: string | null; phone: string; email: string | null } | null
}

const statusConfig: Record<OrderStatus, { label: string; cls: string; next: OrderStatus[] }> = {
  pending:    { label: 'در انتظار پرداخت', cls: 'bg-amber-100 text-amber-800',  next: ['paid', 'cancelled'] },
  paid:       { label: 'پرداخت شده',       cls: 'bg-blue-100 text-blue-800',    next: ['processing', 'cancelled'] },
  processing: { label: 'در حال آماده‌سازی', cls: 'bg-purple-100 text-purple-800', next: ['shipped', 'cancelled'] },
  shipped:    { label: 'ارسال شده',        cls: 'bg-indigo-100 text-indigo-800', next: ['delivered'] },
  delivered:  { label: 'تحویل شده',       cls: 'bg-green-100 text-green-800',  next: ['refunded'] },
  cancelled:  { label: 'لغو شده',         cls: 'bg-red-100 text-red-800',      next: [] },
  refunded:   { label: 'بازگشت وجه',      cls: 'bg-surface-100 text-surface-700', next: [] },
}

const paymentLabel: Record<string, string> = {
  online: 'پرداخت آنلاین',
  cod: 'پرداخت در محل',
  transfer: 'کارت به کارت',
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!id) return
    fetch(`/api/admin/orders/${id}`)
      .then(async (r) => {
        const d = await r.json()
        if (!r.ok) { setError(d.error || 'خطا'); return }
        setOrder(d.order)
      })
      .catch(() => setError('خطای شبکه'))
      .finally(() => setLoading(false))
  }, [id])

  const changeStatus = async (status: OrderStatus) => {
    if (!order) return
    setSaving(true)
    try {
      const r = await fetch(`/api/admin/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (r.ok) setOrder((o) => o ? { ...o, status } : o)
    } finally { setSaving(false) }
  }

  const handlePrint = () => window.print()

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <span className="text-surface-400 text-sm">در حال بارگذاری...</span>
    </div>
  )

  if (error || !order) return (
    <div className="flex-1 flex items-center justify-center gap-3 flex-col">
      <span className="text-red-500 text-sm">{error ?? 'سفارش یافت نشد'}</span>
      <Link href="/admin/orders" className="text-sm text-brand-600">← بازگشت</Link>
    </div>
  )

  const cfg = statusConfig[order.status]
  const nextStatuses = cfg.next

  return (
    <>
      {/* Print Styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #invoice-print, #invoice-print * { visibility: visible; }
          #invoice-print { position: fixed; inset: 0; padding: 2rem; background: white; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b border-surface-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 no-print">
          <div className="flex items-center gap-3">
            <Link href="/admin/orders" className="text-surface-400 hover:text-surface-700 transition-colors">
              <svg viewBox="0 0 20 20" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}><path d="M13 5l-5 5 5 5" strokeLinecap="round" /></svg>
            </Link>
            <div>
              <h1 className="text-lg font-black text-surface-900">سفارش #{order.id.slice(0, 8).toUpperCase()}</h1>
              <p className="text-xs text-surface-400">
                {new Intl.DateTimeFormat('fa-IR', { dateStyle: 'full', timeStyle: 'short' }).format(new Date(order.createdAt))}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="btn btn-outline py-2 px-4 text-sm flex items-center gap-2"
            >
              <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor"><path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v5a2 2 0 002 2h1v2a1 1 0 001 1h8a1 1 0 001-1v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a1 1 0 00-1-1H6a1 1 0 00-1 1zm2 0h6v3H7V4zm-1 9a1 1 0 112 0 1 1 0 01-2 0zm1 3v-2h6v2H7z" clipRule="evenodd" /></svg>
              چاپ فاکتور
            </button>
          </div>
        </header>

        <div className="p-6 max-w-4xl space-y-5">
          {/* Status + Actions */}
          <div className="bg-white rounded-2xl border border-surface-200 p-5 no-print">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-surface-600">وضعیت فعلی:</span>
                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold ${cfg.cls}`}>
                  {cfg.label}
                </span>
              </div>
              {nextStatuses.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-surface-400">تغییر به:</span>
                  {nextStatuses.map((s) => (
                    <button
                      key={s}
                      onClick={() => changeStatus(s)}
                      disabled={saving}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${statusConfig[s].cls} border-current opacity-80 hover:opacity-100`}
                    >
                      {statusConfig[s].label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Invoice print area */}
          <div id="invoice-print" ref={printRef}>
            {/* Invoice Header */}
            <div className="bg-white rounded-2xl border border-surface-200 p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-black text-surface-900">فاکتور فروش</h2>
                  <p className="text-sm text-surface-500 mt-1">شماره: {order.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-sm text-surface-500">
                    تاریخ: {new Intl.DateTimeFormat('fa-IR', { dateStyle: 'long' }).format(new Date(order.createdAt))}
                  </p>
                </div>
                <div className="text-left">
                  <p className="font-black text-lg text-brand-700">بیواز</p>
                  <p className="text-xs text-surface-500">سیستم دزدگیر اماکن</p>
                  <p className="text-xs text-surface-500">bz360.ir</p>
                </div>
              </div>

              {/* Customer Info */}
              {order.shippingAddress && (
                <div className="grid md:grid-cols-2 gap-6 pt-5 border-t border-surface-100">
                  <div>
                    <p className="text-xs font-bold text-surface-500 uppercase mb-2">اطلاعات خریدار</p>
                    <p className="font-semibold text-surface-900">{order.shippingAddress.fullName}</p>
                    <p className="text-sm text-surface-600" dir="ltr">{order.shippingAddress.phone}</p>
                    {order.user?.email && <p className="text-sm text-surface-500">{order.user.email}</p>}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-surface-500 uppercase mb-2">آدرس تحویل</p>
                    <p className="text-sm text-surface-700 leading-6">
                      {order.shippingAddress.province}، {order.shippingAddress.city}،{' '}
                      {order.shippingAddress.address}
                    </p>
                    <p className="text-sm text-surface-500">کد پستی: {order.shippingAddress.postalCode}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Items Table */}
            <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-surface-50">
                  <tr>
                    {['ردیف', 'محصول', 'تعداد', 'قیمت واحد', 'جمع'].map((h) => (
                      <th key={h} className="text-start px-5 py-3 font-bold text-surface-600 text-xs">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {order.items.map((item, i) => (
                    <tr key={item.id}>
                      <td className="px-5 py-4 text-surface-400 text-xs">{(i + 1).toLocaleString('fa-IR')}</td>
                      <td className="px-5 py-4 font-semibold text-surface-900">{item.productName}</td>
                      <td className="px-5 py-4 text-surface-700">{item.quantity.toLocaleString('fa-IR')}</td>
                      <td className="px-5 py-4 text-surface-700">{formatPrice(item.unitPrice)}</td>
                      <td className="px-5 py-4 font-bold text-surface-900">{formatPrice(item.totalPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="border-t border-surface-200 p-5">
                <div className="max-w-xs ms-auto space-y-2">
                  {order.shippingCost != null && order.shippingCost > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-surface-500">هزینه ارسال</span>
                      <span>{formatPrice(order.shippingCost)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-black text-base pt-2 border-t border-surface-200">
                    <span>مبلغ کل</span>
                    <span className="text-brand-700">{formatPrice(order.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-surface-400">
                    <span>روش پرداخت</span>
                    <span>{paymentLabel[order.paymentMethod ?? ''] ?? order.paymentMethod ?? '—'}</span>
                  </div>
                  {order.paymentRef && (
                    <div className="flex justify-between text-xs text-surface-400">
                      <span>کد پیگیری</span>
                      <span dir="ltr">{order.paymentRef}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {order.notes && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-xs font-bold text-amber-700 mb-1">یادداشت سفارش</p>
                <p className="text-sm text-amber-800">{order.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
