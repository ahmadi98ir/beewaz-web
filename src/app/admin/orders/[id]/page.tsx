'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface OrderItem {
  id: string; productName: string; variantName: string | null
  sku: string | null; quantity: number; unitPrice: string; totalPrice: string
}
interface Order {
  id: string; status: string; totalAmount: string; shippingAmount: string
  discountAmount: string; paymentMethod: string | null; trackingCode: string | null
  customerNote: string | null; adminNote: string | null
  shippingAddress: { fullName?: string; phone?: string; city?: string; province?: string; address?: string; postalCode?: string } | null
  createdAt: string; paidAt: string | null; shippedAt: string | null; deliveredAt: string | null
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  pending:    { label: 'در انتظار پرداخت',   cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  paid:       { label: 'پرداخت شده',         cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  processing: { label: 'در حال آماده‌سازی', cls: 'bg-violet-50 text-violet-700 border-violet-200' },
  shipped:    { label: 'ارسال شده',          cls: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  delivered:  { label: 'تحویل داده شده',    cls: 'bg-green-50 text-green-700 border-green-200' },
  cancelled:  { label: 'لغو شده',           cls: 'bg-red-50 text-red-600 border-red-200' },
  refunded:   { label: 'مسترد شده',         cls: 'bg-surface-50 text-surface-500 border-surface-200' },
}
const STATUS_FLOW = ['pending','paid','processing','shipped','delivered']

function fmt(v: string | number) {
  const n = typeof v === 'string' ? parseInt(v) : v
  return `${(n/10).toLocaleString('fa-IR')} تومان`
}
function fdate(d: string | null) {
  if (!d) return '—'
  return new Intl.DateTimeFormat('fa-IR', { dateStyle:'medium', timeStyle:'short' }).format(new Date(d))
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [items, setItems] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const [tracking, setTracking] = useState('')
  const [adminNote, setAdminNote] = useState('')

  const fetchOrder = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/orders/${id}`)
      const j = await res.json() as { order: Order; items: OrderItem[] }
      setOrder(j.order); setItems(j.items)
      setTracking(j.order.trackingCode ?? ''); setAdminNote(j.order.adminNote ?? '')
    } finally { setLoading(false) }
  }, [id])

  useEffect(() => { fetchOrder() }, [fetchOrder])

  const patch = async (body: Record<string, unknown>) => {
    setSaving(true)
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const j = await res.json() as { order: Order }
    setOrder(j.order); setTracking(j.order.trackingCode ?? ''); setAdminNote(j.order.adminNote ?? '')
    setSaving(false); setToast('ذخیره شد'); setTimeout(() => setToast(''), 2500)
  }

  if (loading || !order) return (
    <div className="flex-1 flex items-center justify-center text-surface-300">بارگذاری...</div>
  )

  const cfg = STATUS_MAP[order.status] ?? STATUS_MAP.pending ?? { cls: '', label: '' }

  return (
    <div className="flex-1 overflow-y-auto">
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold">
          ✅ {toast}
        </div>
      )}

      <header className="bg-white border-b border-surface-200 px-6 py-4 flex items-center gap-4">
        <Link href="/admin/orders" className="p-2 rounded-xl hover:bg-surface-100 text-surface-400">
          <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </Link>
        <div className="flex-1">
          <h1 className="text-lg font-black text-surface-900">سفارش #{order.id.slice(0,8).toUpperCase()}</h1>
          <p className="text-xs text-surface-400 mt-0.5">{fdate(order.createdAt)}</p>
        </div>
        <span className={`px-3 py-1.5 rounded-xl border text-sm font-semibold ${cfg.cls}`}>{cfg.label}</span>
      </header>

      <div className="p-6 max-w-5xl mx-auto grid lg:grid-cols-3 gap-6">
        {/* Left */}
        <div className="lg:col-span-2 space-y-5">
          {/* Status pipeline */}
          <div className="bg-white rounded-2xl border border-surface-200 p-6">
            <h3 className="font-bold text-surface-900 mb-4">مرحله سفارش</h3>
            <div className="flex items-center gap-1 overflow-x-auto pb-2">
              {STATUS_FLOW.map((s, i) => {
                const idx = STATUS_FLOW.indexOf(order.status)
                const past = i < idx; const active = i === idx; const future = i > idx
                return (
                  <div key={s} className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => patch({ status: s })} disabled={saving || s === order.status}
                      className={`px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${active ? `${STATUS_MAP[s]?.cls} shadow-sm` : past ? 'bg-surface-50 text-surface-400 border-surface-100 hover:bg-surface-100' : 'bg-white text-surface-300 border-surface-200 hover:bg-surface-50'} disabled:cursor-default`}>
                      {past && '✓ '}{STATUS_MAP[s]?.label}
                    </button>
                    {i < STATUS_FLOW.length - 1 && <svg viewBox="0 0 20 20" className="w-3 h-3 text-surface-200 rotate-180 flex-shrink-0" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>}
                  </div>
                )
              })}
              <button onClick={() => patch({ status: 'cancelled' })} disabled={saving || order.status === 'cancelled' || order.status === 'delivered'}
                className="mr-2 px-3 py-2 rounded-xl border border-red-200 text-red-500 text-xs font-semibold hover:bg-red-50 disabled:opacity-40 flex-shrink-0">
                لغو
              </button>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-surface-100 font-bold text-surface-900">آیتم‌های سفارش</div>
            {items.length === 0 ? (
              <p className="text-center py-8 text-surface-300 text-sm">آیتمی ثبت نشده</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-surface-50 text-xs text-surface-500">
                  <tr>{['محصول','واریانت','SKU','تعداد','قیمت واحد','جمع'].map(h => <th key={h} className="text-start px-5 py-3 font-semibold">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-surface-50">
                  {items.map(item => (
                    <tr key={item.id}>
                      <td className="px-5 py-3.5 font-semibold text-surface-900">{item.productName}</td>
                      <td className="px-5 py-3.5 text-surface-500">{item.variantName ?? '—'}</td>
                      <td className="px-5 py-3.5 text-surface-400 font-mono text-xs">{item.sku ?? '—'}</td>
                      <td className="px-5 py-3.5 font-bold">{item.quantity.toLocaleString('fa-IR')}</td>
                      <td className="px-5 py-3.5 text-surface-600">{fmt(item.unitPrice)}</td>
                      <td className="px-5 py-3.5 font-bold text-surface-900">{fmt(item.totalPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div className="px-6 py-4 bg-surface-50 border-t border-surface-100 flex justify-end gap-8 text-sm">
              {order.discountAmount !== '0' && <span className="text-red-600">تخفیف: -{fmt(order.discountAmount)}</span>}
              {order.shippingAmount !== '0' && <span className="text-surface-600">ارسال: {fmt(order.shippingAmount)}</span>}
              <span className="font-black text-surface-900">جمع کل: {fmt(order.totalAmount)}</span>
            </div>
          </div>

          {/* Tracking + Admin Note */}
          <div className="bg-white rounded-2xl border border-surface-200 p-6 space-y-4">
            <h3 className="font-bold text-surface-900">اطلاعات ارسال و یادداشت</h3>
            <div>
              <label className="block text-xs font-semibold text-surface-500 mb-1.5">کد پیگیری مرسوله</label>
              <input type="text" value={tracking} onChange={e => setTracking(e.target.value)}
                placeholder="کد پیگیری پست..."
                className="w-full px-3.5 py-2.5 text-sm border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-300" dir="ltr" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-surface-500 mb-1.5">یادداشت داخلی (فقط ادمین)</label>
              <textarea value={adminNote} onChange={e => setAdminNote(e.target.value)} rows={3}
                placeholder="یادداشت برای تیم..."
                className="w-full px-3.5 py-2.5 text-sm border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-300 resize-none" />
            </div>
            <button onClick={() => patch({ trackingCode: tracking, adminNote })} disabled={saving}
              className="btn btn-primary text-sm py-2.5 px-5 disabled:opacity-50">
              {saving ? 'ذخیره...' : 'ذخیره تغییرات'}
            </button>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-5">
          {/* Customer */}
          <div className="bg-white rounded-2xl border border-surface-200 p-5">
            <h3 className="font-bold text-surface-900 mb-4">اطلاعات مشتری</h3>
            <div className="space-y-3 text-sm">
              {[
                ['نام', order.shippingAddress?.fullName],
                ['تلفن', order.shippingAddress?.phone],
                ['استان', order.shippingAddress?.province],
                ['شهر', order.shippingAddress?.city],
                ['آدرس', order.shippingAddress?.address],
                ['کد پستی', order.shippingAddress?.postalCode],
              ].map(([k,v]) => v ? (
                <div key={k} className="flex justify-between gap-2">
                  <span className="text-surface-400 flex-shrink-0">{k}</span>
                  <span className="font-semibold text-surface-800 text-end">{v}</span>
                </div>
              ) : null)}
              {order.customerNote && (
                <div className="mt-3 pt-3 border-t border-surface-100">
                  <p className="text-xs text-surface-400 mb-1">یادداشت مشتری</p>
                  <p className="text-surface-700 text-sm">{order.customerNote}</p>
                </div>
              )}
            </div>
          </div>

          {/* Timestamps */}
          <div className="bg-white rounded-2xl border border-surface-200 p-5">
            <h3 className="font-bold text-surface-900 mb-4">تاریخ‌ها</h3>
            <div className="space-y-2.5 text-xs">
              {[['ثبت سفارش', order.createdAt], ['پرداخت', order.paidAt], ['ارسال', order.shippedAt], ['تحویل', order.deliveredAt]].map(([k,v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-surface-400">{k}</span>
                  <span className={`font-semibold ${v ? 'text-surface-800' : 'text-surface-300'}`}>{fdate(v as string|null)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment */}
          <div className="bg-surface-50 rounded-2xl border border-surface-100 p-5">
            <p className="text-xs text-surface-400 mb-1">روش پرداخت</p>
            <p className="font-bold text-surface-800">{{ online:'درگاه آنلاین', card_to_card:'کارت به کارت', cash_on_delivery:'پرداخت در محل', installment:'اقساطی' }[order.paymentMethod ?? ''] ?? '—'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
