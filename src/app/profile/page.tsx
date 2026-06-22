'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { formatPrice, toFaDigits } from '@/lib/utils'
import { UserIcon, MailIcon, PhoneIcon, MapPinIcon, ShoppingCartIcon, CheckIcon, HeartIcon } from '@/components/ui/icons'
import { ProductCard } from '@/components/shop/product-card'
import { useWishlist } from '@/stores/wishlist'
import type { ShopProduct } from '@/lib/shop-product'

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
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Tehran',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

function getLoyaltyTier(totalSpent: number) {
  if (totalSpent >= 10_000_000) return { label: 'ویژه', color: '#9B59B6', emoji: '💎' }
  if (totalSpent >= 2_000_000)  return { label: 'طلایی', color: '#F97316', emoji: '🥇' }
  if (totalSpent >= 500_000)    return { label: 'نقره‌ای', color: '#64748B', emoji: '🥈' }
  return { label: 'برنزی', color: '#C27B52', emoji: '🥉' }
}

const tabs = [
  { key: 'orders',    label: 'سفارشات',        icon: ShoppingCartIcon },
  { key: 'wishlist',  label: 'علاقه‌مندی‌ها',  icon: HeartIcon },
  { key: 'profile',   label: 'اطلاعات حساب',   icon: UserIcon },
  { key: 'address',   label: 'آدرس‌ها',         icon: MapPinIcon },
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

  // ── آدرس ────────────────────────────────────────────────────────────────
  type SavedAddress = { fullName?: string; province?: string; city?: string; street?: string; alley?: string; plaque?: string; unit?: string; postalCode?: string }
  const [address, setAddress] = useState<SavedAddress | null>(null)
  const [addrEdit, setAddrEdit] = useState(false)
  const [addrForm, setAddrForm] = useState<SavedAddress>({})
  const [addrSaving, setAddrSaving] = useState(false)
  const [addrSaved, setAddrSaved] = useState(false)

  useEffect(() => {
    fetch('/api/profile/last-address')
      .then(r => r.json())
      .then((d: { address: SavedAddress | null }) => {
        if (d.address) { setAddress(d.address); setAddrForm(d.address) }
      })
      .catch(() => {})
  }, [])

  // ── علاقه‌مندی‌ها ───────────────────────────────────────────────────────
  const wishlistIds = useWishlist((s) => s.ids)
  const [wishlistItems, setWishlistItems] = useState<ShopProduct[]>([])
  const [wishlistLoading, setWishlistLoading] = useState(true)

  useEffect(() => {
    fetch('/api/wishlist')
      .then((r) => r.json())
      .then((d: { items?: ShopProduct[] }) => setWishlistItems(d.items ?? []))
      .catch(() => {})
      .finally(() => setWishlistLoading(false))
  }, [])

  const visibleWishlist = wishlistItems.filter((p) => wishlistIds.has(p.id))

  // باز کردن مستقیم یک تب بر اساس ?tab= در URL (مثلاً از toast «مشاهده لیست»)
  useEffect(() => {
    const tab = new URLSearchParams(window.location.search).get('tab')
    if (tab && tabs.some((t) => t.key === tab)) setActiveTab(tab)
  }, [])

  const onSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddrSaving(true)
    try {
      await fetch('/api/profile/address', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addrForm),
      })
      setAddress(addrForm)
      setAddrEdit(false)
      setAddrSaved(true)
      setTimeout(() => setAddrSaved(false), 2500)
    } catch {}
    finally { setAddrSaving(false) }
  }

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
      setTimeout(() => setSaved(false), 2500)
    } catch {}
    setSaving(false)
  }

  const displayName = user?.fullName ?? session?.user?.name ?? null
  const phone = user?.phone ?? (session?.user as { phone?: string })?.phone ?? '—'
  const totalSpent = userOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0)
  const tier = getLoyaltyTier(totalSpent)

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="text-surface-400 text-sm flex items-center gap-2">
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          در حال بارگذاری...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-50 py-8">
      <div className="container-main max-w-4xl space-y-5">

        {/* ─── بنر تکمیل پروفایل ──────────────────────────────────── */}
        {!displayName && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
            <div>
              <p className="font-bold text-amber-800 text-sm">پروفایل شما ناقص است</p>
              <p className="text-amber-600 text-xs mt-0.5">نام خود را تکمیل کنید تا تجربه بهتری داشته باشید</p>
            </div>
            <Link
              href="/profile/complete"
              className="btn text-sm py-2 px-4 flex-shrink-0 font-semibold"
              style={{ background: '#F97316', color: '#fff' }}
            >
              تکمیل پروفایل
            </Link>
          </div>
        )}

        {/* ─── کارت باشگاه مشتریان ────────────────────────────────── */}
        <div
          className="rounded-3xl overflow-hidden relative"
          style={{ background: 'linear-gradient(135deg, #1B3A8A 0%, #152E70 50%, #0F2155 100%)' }}
        >
          {/* Decorative circles */}
          <div
            className="absolute -top-10 -end-10 w-48 h-48 rounded-full opacity-10"
            style={{ background: '#F97316' }}
          />
          <div
            className="absolute -bottom-8 -start-8 w-36 h-36 rounded-full opacity-10"
            style={{ background: '#F97316' }}
          />

          <div className="relative p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">

            {/* آواتار */}
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-black flex-shrink-0 border-2 border-white/20"
              style={{ background: 'rgba(255,255,255,0.15)' }}
            >
              {displayName ? displayName[0] : '؟'}
            </div>

            {/* اطلاعات */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-black text-white">
                  {displayName ?? 'کاربر مهمان'}
                </h1>
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold text-white"
                  style={{ background: 'rgba(255,255,255,0.2)' }}
                >
                  {tier.emoji} {tier.label}
                </span>
              </div>
              <p className="text-blue-200 font-mono text-sm mt-1">{toFaDigits(phone)}</p>
              {user?.createdAt && (
                <p className="text-blue-300 text-xs mt-1">
                  عضو از {formatJalaliDate(user.createdAt)}
                </p>
              )}
            </div>

            {/* آمار سریع */}
            <div className="flex gap-5 sm:gap-6 flex-shrink-0">
              <div className="text-center">
                <p className="text-2xl font-black text-white">{toFaDigits(userOrders.length)}</p>
                <p className="text-blue-300 text-xs mt-0.5">سفارش</p>
              </div>
              <div className="w-px bg-white/15 self-stretch hidden sm:block" />
              <div className="text-center">
                <p className="text-lg font-black text-white whitespace-nowrap">
                  {formatPrice(totalSpent)}
                </p>
                <p className="text-blue-300 text-xs mt-0.5">خرید کل</p>
              </div>
            </div>

          </div>

          {/* نوار پیشرفت سطح */}
          <div className="px-6 pb-5">
            <div className="flex items-center justify-between text-xs text-blue-300 mb-1.5">
              <span>سطح {tier.label}</span>
              {totalSpent < 10_000_000 && (
                <span>
                  {totalSpent < 500_000
                    ? `${formatPrice(500_000 - totalSpent)} تا نقره‌ای`
                    : totalSpent < 2_000_000
                    ? `${formatPrice(2_000_000 - totalSpent)} تا طلایی`
                    : `${formatPrice(10_000_000 - totalSpent)} تا ویژه`}
                </span>
              )}
            </div>
            <div className="h-1.5 rounded-full bg-white/15 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  background: '#F97316',
                  width: `${Math.min(100, (totalSpent / 10_000_000) * 100)}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* ─── تب‌ها ──────────────────────────────────────────────── */}
        <div className="flex gap-0.5 bg-white border border-surface-200 rounded-2xl p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === tab.key
                    ? 'text-white shadow-sm'
                    : 'text-surface-500 hover:text-surface-700'
                }`}
                style={activeTab === tab.key ? { background: '#F97316' } : undefined}
              >
                <Icon size={15} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* ─── تب سفارشات ─────────────────────────────────────────── */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
            {userOrders.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-16 h-16 rounded-2xl bg-surface-100 flex items-center justify-center mx-auto mb-4">
                  <ShoppingCartIcon size={28} className="text-surface-300" />
                </div>
                <p className="text-surface-500 font-semibold mb-1">هنوز سفارشی ندارید</p>
                <p className="text-surface-400 text-sm mb-6">اولین سفارش خود را ثبت کنید</p>
                <Link href="/shop" className="btn btn-accent py-2.5 px-7 text-sm">
                  رفتن به فروشگاه
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-surface-50 text-surface-500 text-xs border-b border-surface-100">
                    <tr>
                      {['شناسه سفارش', 'تاریخ', 'تعداد کالا', 'مبلغ کل', 'وضعیت', ''].map((h) => (
                        <th key={h} className="text-start px-5 py-3 font-semibold whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-100">
                    {userOrders.map((order) => {
                      const sc = statusMap[order.status] ?? { label: order.status, cls: 'bg-surface-100 text-surface-600 border-surface-200' }
                      return (
                        <tr key={order.id} className="hover:bg-surface-50 transition-colors">
                          <td className="px-5 py-4 font-mono text-xs font-bold text-surface-600">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </td>
                          <td className="px-5 py-4 text-surface-500 text-xs whitespace-nowrap">
                            {formatJalaliDate(order.createdAt)}
                          </td>
                          <td className="px-5 py-4">
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-surface-100 text-surface-700 text-xs font-bold">
                              {toFaDigits(order.itemCount)}
                            </span>
                          </td>
                          <td className="px-5 py-4 font-bold text-surface-900 whitespace-nowrap">
                            {formatPrice(order.totalAmount)}
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold border ${sc.cls}`}>
                              {sc.label}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <Link href={`/orders/${order.id}`} className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors">
                              مشاهده
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ─── تب علاقه‌مندی‌ها ────────────────────────────────────── */}
        {activeTab === 'wishlist' && (
          <div>
            {wishlistLoading ? (
              <div className="bg-white rounded-2xl border border-surface-200 py-16 text-center text-surface-400 text-sm">
                در حال بارگذاری...
              </div>
            ) : visibleWishlist.length === 0 ? (
              <div className="bg-white rounded-2xl border border-surface-200 text-center py-16 px-4">
                <div className="w-16 h-16 rounded-2xl bg-surface-100 flex items-center justify-center mx-auto mb-4">
                  <HeartIcon size={28} className="text-surface-300" />
                </div>
                <p className="text-surface-500 font-semibold mb-1">لیست علاقه‌مندی‌های شما خالی است</p>
                <p className="text-surface-400 text-sm mb-6">محصولات مورد علاقه خود را با ضربه روی آیکون قلب ذخیره کنید</p>
                <Link href="/shop" className="btn btn-accent py-2.5 px-7 text-sm">
                  رفتن به فروشگاه
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {visibleWishlist.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── تب اطلاعات حساب ────────────────────────────────────── */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl border border-surface-200 p-6">
            <h2 className="font-black text-surface-900 mb-6 text-base flex items-center gap-2">
              <UserIcon size={18} className="text-surface-500" />
              اطلاعات حساب کاربری
            </h2>
            <form onSubmit={onSave} className="space-y-5 max-w-lg">

              <div>
                <label className="block text-sm font-semibold text-surface-700 mb-1.5">
                  نام و نام‌خانوادگی
                </label>
                <div className="relative">
                  <UserIcon size={15} className="absolute top-1/2 -translate-y-1/2 end-3.5 text-surface-400" />
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="input w-full pe-10"
                    placeholder="نام و نام‌خانوادگی"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-surface-700 mb-1.5">
                  شماره موبایل
                </label>
                <div className="relative">
                  <PhoneIcon size={15} className="absolute top-1/2 -translate-y-1/2 end-3.5 text-surface-300" />
                  <input
                    type="tel"
                    value={toFaDigits(phone)}
                    disabled
                    className="input w-full pe-10 bg-surface-50 text-surface-400 cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-surface-400 mt-1">شماره موبایل قابل تغییر نیست</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-surface-700 mb-1.5">
                  ایمیل
                  <span className="text-xs text-surface-400 font-normal ms-2">(اختیاری)</span>
                </label>
                <div className="relative">
                  <MailIcon size={15} className="absolute top-1/2 -translate-y-1/2 end-3.5 text-surface-400" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="input w-full pe-10"
                    dir="ltr"
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-accent py-2.5 px-6 text-sm"
                >
                  {saving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                </button>
                {saved && (
                  <span className="text-green-600 text-sm font-semibold flex items-center gap-1">
                    <CheckIcon size={16} />
                    ذخیره شد
                  </span>
                )}
              </div>
            </form>

            {/* خروج از حساب */}
            <div className="mt-10 pt-6 border-t border-surface-100">
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors"
              >
                خروج از حساب کاربری
              </button>
            </div>
          </div>
        )}

        {/* ─── تب آدرس‌ها ─────────────────────────────────────────── */}
        {activeTab === 'address' && (
          <div className="bg-white rounded-2xl border border-surface-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-surface-100">
              <h2 className="text-base font-bold text-surface-800">آدرس ارسال</h2>
              {address && !addrEdit && (
                <button onClick={() => setAddrEdit(true)} className="btn btn-ghost py-1.5 px-4 text-sm text-brand-600">
                  ویرایش
                </button>
              )}
            </div>

            {!addrEdit && !address && (
              <div className="text-center py-8">
                <div className="w-14 h-14 rounded-2xl bg-surface-100 flex items-center justify-center mx-auto mb-3">
                  <MapPinIcon size={24} className="text-surface-400" />
                </div>
                <p className="text-surface-500 text-sm mb-4">هنوز آدرسی ذخیره نشده است.</p>
                <button onClick={() => setAddrEdit(true)} className="btn btn-primary py-2 px-6 text-sm">
                  افزودن آدرس
                </button>
              </div>
            )}

            {!addrEdit && address && (
              <div className="space-y-3 text-sm">
                {addrSaved && (
                  <div className="flex items-center gap-2 text-green-600 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 mb-4">
                    <CheckIcon size={16} />
                    <span className="font-semibold">آدرس ذخیره شد</span>
                  </div>
                )}
                <div className="bg-surface-50 rounded-xl p-4 space-y-2">
                  {address.fullName && <p><span className="text-surface-400 ml-2">گیرنده:</span><span className="font-semibold text-surface-800">{address.fullName}</span></p>}
                  {(address.province || address.city) && <p><span className="text-surface-400 ml-2">استان/شهر:</span><span className="font-semibold text-surface-800">{[address.province, address.city].filter(Boolean).join('، ')}</span></p>}
                  {address.street && <p><span className="text-surface-400 ml-2">خیابان:</span><span className="font-semibold text-surface-800">{[address.street, address.alley].filter(Boolean).join(' — ')}</span></p>}
                  {address.plaque && <p><span className="text-surface-400 ml-2">پلاک:</span><span className="font-semibold text-surface-800">{address.plaque}{address.unit ? ` واحد ${address.unit}` : ''}</span></p>}
                  {address.postalCode && <p><span className="text-surface-400 ml-2">کد پستی:</span><span className="font-mono font-semibold text-surface-800">{address.postalCode}</span></p>}
                </div>
                <p className="text-xs text-surface-400 pt-1">این آدرس در خرید بعدی شما پیش‌فرض خواهد بود.</p>
              </div>
            )}

            {addrEdit && (
              <form onSubmit={onSaveAddress} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-surface-700 mb-1.5">نام گیرنده</label>
                    <input value={addrForm.fullName ?? ''} onChange={e => setAddrForm(f => ({...f, fullName: e.target.value}))} className="input w-full" placeholder="نام و نام‌خانوادگی" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-surface-700 mb-1.5">استان</label>
                    <input value={addrForm.province ?? ''} onChange={e => setAddrForm(f => ({...f, province: e.target.value}))} className="input w-full" placeholder="مثال: تهران" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-surface-700 mb-1.5">شهر</label>
                    <input value={addrForm.city ?? ''} onChange={e => setAddrForm(f => ({...f, city: e.target.value}))} className="input w-full" placeholder="نام شهر" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-surface-700 mb-1.5">خیابان اصلی</label>
                    <input value={addrForm.street ?? ''} onChange={e => setAddrForm(f => ({...f, street: e.target.value}))} className="input w-full" placeholder="مثال: خیابان ولیعصر" required />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-surface-700 mb-1.5">کوچه / خیابان فرعی <span className="text-surface-400 font-normal">(اختیاری)</span></label>
                    <input value={addrForm.alley ?? ''} onChange={e => setAddrForm(f => ({...f, alley: e.target.value}))} className="input w-full" placeholder="کوچه گلستان" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-surface-700 mb-1.5">پلاک</label>
                    <input value={addrForm.plaque ?? ''} onChange={e => setAddrForm(f => ({...f, plaque: e.target.value}))} className="input w-full" placeholder="۱۲" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-surface-700 mb-1.5">واحد <span className="text-surface-400 font-normal">(اختیاری)</span></label>
                    <input value={addrForm.unit ?? ''} onChange={e => setAddrForm(f => ({...f, unit: e.target.value}))} className="input w-full" placeholder="۳" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-surface-700 mb-1.5">کد پستی</label>
                    <input value={addrForm.postalCode ?? ''} onChange={e => setAddrForm(f => ({...f, postalCode: e.target.value}))} className="input w-full" placeholder="۱۰ رقم" dir="ltr" inputMode="numeric" maxLength={10} required />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={addrSaving} className="btn btn-primary py-2.5 px-6 text-sm flex-1">
                    {addrSaving ? 'در حال ذخیره...' : 'ذخیره آدرس'}
                  </button>
                  {address && (
                    <button type="button" onClick={() => { setAddrEdit(false); setAddrForm(address) }} className="btn btn-ghost py-2.5 px-4 text-sm">
                      انصراف
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
