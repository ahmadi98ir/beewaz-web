'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatPrice, toFaDigits } from '@/lib/utils'

// ── Types ─────────────────────────────────────────────────────────────────────

interface User {
  id: string; fullName: string | null; phone: string; email: string | null
  role: string; isVerified: boolean; createdAt: string
}
interface Order {
  id: string; status: string; totalAmount: string | null
  shippingAddress: { fullName?: string; city?: string } | null
  trackingCode: string | null; createdAt: string
}
interface Note { id: string; note: string; createdAt: string }
interface Stats { totalOrders: number; totalSpent: number }

// ── Helpers ───────────────────────────────────────────────────────────────────

function getLoyaltyTier(spent: number) {
  if (spent >= 50_000_000) return { label: 'پلاتینیوم', color: '#8B5CF6', bg: '#EDE9FE' }
  if (spent >= 20_000_000) return { label: 'طلایی',     color: '#D97706', bg: '#FEF3C7' }
  if (spent >= 5_000_000)  return { label: 'نقره‌ای',   color: '#64748B', bg: '#F1F5F9' }
  return                           { label: 'برنزی',    color: '#92400E', bg: '#FEF3C7' }
}

const ORDER_STATUS: Record<string, { label: string; cls: string }> = {
  pending:    { label: 'در انتظار',   cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  paid:       { label: 'پرداخت‌شده', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  processing: { label: 'آماده‌سازی', cls: 'bg-violet-50 text-violet-700 border-violet-200' },
  shipped:    { label: 'ارسال‌شده',  cls: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  delivered:  { label: 'تحویل‌شده', cls: 'bg-green-50 text-green-700 border-green-200' },
  cancelled:  { label: 'لغو‌شده',   cls: 'bg-red-50 text-red-600 border-red-200' },
}

function fa(d: string) { return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(d)) }

// ── Main ──────────────────────────────────────────────────────────────────────

export default function CustomerProfilePage() {
  const { id } = useParams<{ id: string }>()
  const router  = useRouter()

  const [user,   setUser]   = useState<User   | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [notes,  setNotes]  = useState<Note[]>([])
  const [stats,  setStats]  = useState<Stats>({ totalOrders: 0, totalSpent: 0 })
  const [loading, setLoading] = useState(true)
  const [noteText, setNoteText] = useState('')
  const [saving,   setSaving]   = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const r = await fetch(`/api/admin/users/${id}`)
    if (!r.ok) { router.push('/admin/users'); return }
    const d = await r.json() as { user: User; orders: Order[]; stats: Stats; notes: Note[] }
    setUser(d.user); setOrders(d.orders); setStats(d.stats); setNotes(d.notes)
    setLoading(false)
  }, [id, router])

  useEffect(() => { void load() }, [load])

  const addNote = async () => {
    if (!noteText.trim() || saving) return
    setSaving(true)
    const r = await fetch(`/api/admin/users/${id}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note: noteText.trim() }),
    })
    if (r.ok) {
      const d = await r.json() as { note: Note }
      setNotes((p) => [d.note, ...p])
      setNoteText('')
    }
    setSaving(false)
  }

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!user) return null

  const tier = getLoyaltyTier(stats.totalSpent)

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <header className="bg-white border-b border-surface-200 px-6 py-4 flex items-center gap-4">
        <Link href="/admin/users" className="text-surface-400 hover:text-surface-700 transition-colors">
          <svg viewBox="0 0 20 20" className="w-5 h-5" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
        </Link>
        <div>
          <h1 className="text-lg font-black text-surface-900">{user.fullName ?? 'مشتری ناشناس'}</h1>
          <p className="text-xs text-surface-400" dir="ltr">{user.phone}</p>
        </div>
        <span className="ms-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border" style={{ background: tier.bg, color: tier.color, borderColor: tier.color + '40' }}>
          {tier.label}
        </span>
      </header>

      <div className="p-6 max-w-5xl mx-auto space-y-6">

        {/* KPI row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'کل سفارشات',  value: toFaDigits(stats.totalOrders),            sub: 'سفارش' },
            { label: 'مجموع خرید',  value: formatPrice(stats.totalSpent),              sub: '' },
            { label: 'عضویت از',    value: fa(user.createdAt).split('،')[0],           sub: '' },
            { label: 'نقش',         value: user.role === 'admin' ? 'مدیر' : user.role === 'sales_agent' ? 'کارشناس' : 'مشتری', sub: '' },
          ].map((c) => (
            <div key={c.label} className="bg-white rounded-2xl border border-surface-200 p-4">
              <p className="text-xs text-surface-400 mb-1">{c.label}</p>
              <p className="text-xl font-black text-surface-900">{c.value} <span className="text-sm font-normal text-surface-500">{c.sub}</span></p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* سفارشات */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-surface-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-surface-100 flex items-center justify-between">
              <h2 className="font-bold text-surface-900">سفارشات</h2>
              <span className="text-xs text-surface-400">{toFaDigits(orders.length)} سفارش</span>
            </div>
            {orders.length === 0 ? (
              <p className="text-sm text-surface-400 text-center py-10">هیچ سفارشی ثبت نشده</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-surface-50 text-surface-500 text-xs">
                    <tr>
                      {['شناسه', 'مبلغ', 'وضعیت', 'تاریخ'].map((h) => (
                        <th key={h} className="text-start px-4 py-3 font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-100">
                    {orders.map((o) => {
                      const st = ORDER_STATUS[o.status] ?? { label: o.status, cls: 'bg-surface-100 text-surface-700 border-surface-200' }
                      return (
                        <tr key={o.id} className="hover:bg-surface-50 transition-colors">
                          <td className="px-4 py-3">
                            <Link href={`/admin/orders/${o.id}`} className="font-mono text-xs text-brand-600 hover:underline">
                              {o.id.slice(0, 8).toUpperCase()}
                            </Link>
                          </td>
                          <td className="px-4 py-3 font-bold">{formatPrice(o.totalAmount)}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-0.5 rounded-lg text-xs font-semibold border ${st.cls}`}>{st.label}</span>
                          </td>
                          <td className="px-4 py-3 text-surface-400 text-xs">{fa(o.createdAt)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* یادداشت‌های داخلی */}
          <div className="bg-white rounded-2xl border border-surface-200 flex flex-col">
            <div className="px-5 py-4 border-b border-surface-100">
              <h2 className="font-bold text-surface-900">یادداشت‌های داخلی</h2>
              <p className="text-xs text-surface-400 mt-0.5">برای تیم فروش — مشتری نمی‌بیند</p>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 max-h-72">
              {notes.length === 0 ? (
                <p className="text-sm text-surface-400 text-center py-6">یادداشتی ندارد</p>
              ) : (
                notes.map((n) => (
                  <div key={n.id} className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                    <p className="text-sm text-surface-800 leading-relaxed">{n.note}</p>
                    <p className="text-[10px] text-surface-400 mt-2">{fa(n.createdAt)}</p>
                  </div>
                ))
              )}
            </div>
            <div className="p-4 border-t border-surface-100">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="یادداشت جدید..."
                className="input w-full text-sm resize-none"
                rows={2}
              />
              <button
                onClick={addNote}
                disabled={saving || !noteText.trim()}
                className="btn btn-primary w-full mt-2 py-2 text-sm"
              >
                {saving ? 'در حال ذخیره...' : 'ذخیره یادداشت'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
