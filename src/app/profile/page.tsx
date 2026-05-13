'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'

type ProfileData = {
  id: string
  fullName: string | null
  phone: string
  email: string | null
  createdAt: string
}

type OrderRow = {
  id: string
  status: string
  totalAmount: number
  createdAt: string
  itemCount: number
}

const statusMap: Record<string, { label: string; cls: string }> = {
  pending:    { label: 'در انتظار پرداخت', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  paid:       { label: 'پرداخت شده',       cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  processing: { label: 'در حال پردازش',    cls: 'bg-purple-50 text-purple-700 border-purple-200' },
  shipped:    { label: 'ارسال شده',        cls: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  delivered:  { label: 'تحویل شده',        cls: 'bg-green-50 text-green-700 border-green-200' },
  cancelled:  { label: 'لغو شده',          cls: 'bg-red-50 text-red-700 border-red-200' },
  refunded:   { label: 'مسترد شده',        cls: 'bg-surface-100 text-surface-600 border-surface-200' },
}

function formatJalaliDate(iso: string) {
  try {
    return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(iso))
  } catch {
    return iso
  }
}

const tabs = [
  { key: 'orders', label: 'سفارشات' },
  { key: 'profile', label: 'اطلاعات حساب' },
]

export default function ProfilePage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState('orders')
  const [user, setUser] = useState<ProfileData | null>(null)
  const [userOrders, setUserOrders] = useState<OrderRow[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ fullName: '', email: '' })
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/profile')
      .then((r) => r.json())
      .then((data: { user: ProfileData; orders: OrderRow[] }) => {
        setUser(data.user)
        setUserOrders(data.orders ?? [])
        setForm({ fullName: data.user?.fullName ?? '', email: data.user?.email ?? '' })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: form.fullName, email: form.email }),
      })
      setUser((u) => u ? { ...u, fullName: form.fullName, email: form.email || null } : u)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {}
    setSaving(false)
  }

  const displayName = user?.fullName ?? session?.user?.name ?? '—'
  const phone = user?.phone ?? (session?.user as { phone?: string })?.phone ?? '—'

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="text-surface-400 text-sm">در حال بارگذاری...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-50 py-8">
      <div className="container-main max-w-4xl">

        {/* Header */}
        <div className="bg-white rounded-2xl border border-surface-200 p-6 mb-6 flex items-center gap-5">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-black flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #1B3A8A, #F97316)' }}
          >
            {displayName[0] ?? '؟'}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-black text-surface-900">{displayName}</h1>
            <p className="text-sm text-surface-400 font-mono mt-0.5" dir="ltr">{phone}</p>
            {user?.createdAt && (
              <p className="text-xs text-surface-400 mt-1">عضو از {formatJalaliDate(user.createdAt)}</p>
            )}
          </div>
          <div className="text-end">
            <p className="text-xs text-surface-400">مجموع سفارشات</p>
            <p className="text-lg font-black text-surface-900">{userOrders.length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0.5 bg-white border border-surface-200 rounded-2xl p-1 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.key ? 'text-white shadow-sm' : 'text-surface-500 hover:text-surface-700'}`}
              style={activeTab === tab.key ? { background: '#F97316' } : undefined}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden overflow-x-auto">
            {userOrders.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-surface-400 text-sm mb-4">هنوز سفارشی ثبت نکرده‌اید</p>
                <Link href="/shop" className="btn btn-accent py-2.5 px-6 text-sm">رفتن به فروشگاه</Link>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-surface-50 text-surface-500 text-xs">
                  <tr>
                    {['شناسه سفارش', 'تاریخ', 'تعداد کالا', 'مبلغ کل', 'وضعیت'].map((h) => (
                      <th key={h} className="text-start px-5 py-3 font-semibold whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {userOrders.map((order) => {
                    const sc = statusMap[order.status] ?? { label: order.status, cls: 'bg-surface-100 text-surface-600 border-surface-200' }
                    return (
                      <tr key={order.id} className="hover:bg-surface-50 transition-colors">
                        <td className="px-5 py-4 font-mono text-xs font-bold text-surface-600">{order.id.slice(0, 8).toUpperCase()}</td>
                        <td className="px-5 py-4 text-surface-500 text-xs">{formatJalaliDate(order.createdAt)}</td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-surface-100 text-surface-700 text-xs font-bold">
                            {order.itemCount}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-bold text-surface-900 whitespace-nowrap">{formatPrice(order.totalAmount)}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold border ${sc.cls}`}>
                            {sc.label}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl border border-surface-200 p-7">
            <h2 className="font-black text-surface-900 mb-6">اطلاعات حساب</h2>
            <form onSubmit={onSave} className="space-y-5 max-w-md">
              <div>
                <label className="block text-sm font-semibold text-surface-700 mb-1.5">نام و نام‌خانوادگی</label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-surface-700 mb-1.5">شماره موبایل</label>
                <input
                  type="tel"
                  value={phone}
                  disabled
                  className="input w-full bg-surface-50 text-surface-400 cursor-not-allowed"
                  dir="ltr"
                />
                <p className="text-xs text-surface-400 mt-1">شماره موبایل قابل تغییر نیست</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-surface-700 mb-1.5">ایمیل (اختیاری)</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input w-full"
                  dir="ltr"
                />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn btn-accent py-2.5 px-6 text-sm">
                  {saving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                </button>
                {saved && (
                  <span className="text-green-600 text-sm font-semibold flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    ذخیره شد
                  </span>
                )}
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  )
}
