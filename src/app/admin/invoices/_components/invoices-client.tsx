'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { saveInvoiceSettings } from '../actions'
import type { InvoiceSettings, InvoiceOrder } from '../types'
import { PrintableInvoice } from './printable-invoice'

// ─── Shared styles ────────────────────────────────────────────────────────────

const inputCls = [
  'w-full rounded-xl px-3.5 py-2.5',
  'bg-[#1e1e3a] border border-[rgba(255,255,255,0.10)]',
  'text-white text-sm placeholder:text-white/25',
  'focus:outline-none focus:border-indigo-500/60 focus:bg-[#222240]',
  '[color-scheme:dark] transition-colors duration-150',
].join(' ')

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-white/60 uppercase tracking-wide">{label}</label>
      {children}
      {hint && <p className="text-xs text-white/25">{hint}</p>}
    </div>
  )
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  paid:        { label: 'پرداخت شده', cls: 'bg-emerald-500/15 text-emerald-300' },
  processing:  { label: 'در حال آماده‌سازی', cls: 'bg-blue-500/15 text-blue-300' },
  shipped:     { label: 'ارسال شده', cls: 'bg-indigo-500/15 text-indigo-300' },
  delivered:   { label: 'تحویل داده شده', cls: 'bg-teal-500/15 text-teal-300' },
  cancelled:   { label: 'لغو شده', cls: 'bg-red-500/15 text-red-300' },
  refunded:    { label: 'مسترد شده', cls: 'bg-orange-500/15 text-orange-300' },
  pending:     { label: 'در انتظار', cls: 'bg-amber-500/15 text-amber-300' },
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] ?? { label: status, cls: 'bg-white/[0.08] text-white/50' }
  return <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${s.cls}`}>{s.label}</span>
}

function formatToman(rial: string | null | undefined) {
  return (Math.floor(Number(rial ?? 0) / 10)).toLocaleString('fa-IR') + ' ت'
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('fa-IR', { year: 'numeric', month: 'short', day: 'numeric' })
}

// ─── Invoice Modal ────────────────────────────────────────────────────────────

function InvoiceModal({
  order, settings, onClose,
}: {
  order: InvoiceOrder
  settings: InvoiceSettings
  onClose: () => void
}) {
  const printRef = useRef<HTMLDivElement>(null)

  function handlePrint() {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-2xl bg-[#0f0f22] border border-white/[0.10] rounded-2xl shadow-2xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div>
            <h3 className="text-white font-bold">
              فاکتور شماره {order.invoiceNumber ? order.invoiceNumber.toLocaleString('fa-IR') : '—'}
            </h3>
            <p className="text-white/30 text-xs mt-0.5">
              {order.shippingAddress?.fullName ?? order.customerName ?? order.customerPhone}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a1 1 0 001 1h8a1 1 0 001-1v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a1 1 0 00-1-1H6a1 1 0 00-1 1zm2 0h6v3H7V4zm-1 9h8v4H6v-4zm8-4a1 1 0 110 2 1 1 0 010-2z" clipRule="evenodd" />
              </svg>
              چاپ / PDF
            </button>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/[0.06] hover:bg-white/[0.10] flex items-center justify-center text-white/50 transition-colors">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Preview (dark) */}
        <div ref={printRef} className="p-6 overflow-y-auto max-h-[70vh]">
          {/* خلاصه در حالت دارک */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.06]">
              <p className="text-xs text-white/40 mb-2 font-semibold uppercase tracking-wide">فروشنده</p>
              <p className="text-white text-sm font-semibold">{settings.invoice_company_name || '—'}</p>
              <p className="text-white/40 text-xs mt-1">{settings.invoice_address || '—'}</p>
              <p className="text-white/40 text-xs">{settings.invoice_phone || '—'}</p>
            </div>
            <div className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.06]">
              <p className="text-xs text-white/40 mb-2 font-semibold uppercase tracking-wide">خریدار</p>
              <p className="text-white text-sm font-semibold">
                {order.shippingAddress?.fullName ?? order.customerName ?? order.customerPhone}
              </p>
              <p className="text-white/40 text-xs mt-1">{order.customerPhone}</p>
              {order.shippingAddress && (
                <p className="text-white/40 text-xs">
                  {[order.shippingAddress.province, order.shippingAddress.city, order.shippingAddress.street].filter(Boolean).join('، ')}
                </p>
              )}
            </div>
          </div>

          {/* آیتم‌ها */}
          <div className="rounded-xl border border-white/[0.06] overflow-hidden mb-4">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.03]">
                  {['کالا', 'تعداد', 'قیمت واحد', 'جمع'].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-right text-[11px] font-semibold text-white/30 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id} className="border-b border-white/[0.04]">
                    <td className="px-4 py-3">
                      <p className="text-sm text-white">{item.productName}</p>
                      {item.variantName && <p className="text-xs text-white/40">{item.variantName}</p>}
                    </td>
                    <td className="px-4 py-3 text-sm text-white/60 text-center">{item.quantity.toLocaleString('fa-IR')}</td>
                    <td className="px-4 py-3 text-sm text-white/60 text-left" dir="ltr">{formatToman(item.unitPrice)}</td>
                    <td className="px-4 py-3 text-sm text-white font-semibold text-left" dir="ltr">{formatToman(item.totalPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* جمع */}
          <div className="flex justify-end">
            <div className="w-64 space-y-1.5">
              {[
                ['هزینه ارسال', formatToman(order.shippingAmount)],
                ['تخفیف', `(${formatToman(order.discountAmount)})`],
                ...(Number(order.taxAmount) > 0 ? [['مالیات', formatToman(order.taxAmount)]] : []),
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between text-sm text-white/50">
                  <span>{label}</span><span>{val}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm font-bold text-white border-t border-white/[0.10] pt-2 mt-2">
                <span>مبلغ نهایی</span>
                <span className="text-emerald-400">{formatToman(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* PrintableInvoice — فقط هنگام print نمایش داده می‌شود */}
        <PrintableInvoice order={order} settings={settings} />
      </div>
    </div>
  )
}

// ─── Tab: Orders List ─────────────────────────────────────────────────────────

function OrdersTab({
  orders, settings,
}: {
  orders: InvoiceOrder[]
  settings: InvoiceSettings
}) {
  const [selected, setSelected] = useState<InvoiceOrder | null>(null)

  return (
    <>
      <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <div>
            <h2 className="text-white font-bold text-sm">سفارشات قابل فاکتور</h2>
            <p className="text-white/40 text-xs mt-0.5">{orders.length} سفارش موفق</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="px-6 py-16 text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8 text-white/20">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <p className="text-white/30 text-sm">هیچ سفارش پرداخت‌شده‌ای یافت نشد</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {['شماره فاکتور', 'مشتری', 'تاریخ', 'مبلغ', 'وضعیت', 'عملیات'].map((h) => (
                    <th key={h} className="px-5 py-3 text-right text-[11px] font-semibold text-white/30 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-sm text-white/70">
                        {order.invoiceNumber ? `#${order.invoiceNumber.toLocaleString('fa-IR')}` : '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm text-white">{order.shippingAddress?.fullName ?? order.customerName ?? '—'}</p>
                      <p className="text-xs text-white/40">{order.customerPhone}</p>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-white/50">{formatDate(order.paidAt ?? order.createdAt)}</td>
                    <td className="px-5 py-3.5 text-sm text-white font-semibold">{formatToman(order.totalAmount)}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={order.status} /></td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => setSelected(order)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-semibold transition-all"
                      >
                        <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                          <path d="M8 9.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                          <path fillRule="evenodd" d="M1.38 8a7.5 7.5 0 0113.24 0 7.5 7.5 0 01-13.24 0zM8 3a5 5 0 100 10A5 5 0 008 3z" clipRule="evenodd" />
                        </svg>
                        مشاهده فاکتور
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <InvoiceModal order={selected} settings={settings} onClose={() => setSelected(null)} />
      )}
    </>
  )
}

// ─── Tab: Settings ────────────────────────────────────────────────────────────

function SettingsTab({ initial }: { initial: InvoiceSettings }) {
  const [form, setForm] = useState<InvoiceSettings>(initial)
  const [saved, setSaved] = useState(false)
  const [pending, start] = useTransition()

  function set(key: keyof InvoiceSettings, value: string) {
    setForm((p) => ({ ...p, [key]: value }))
  }

  function handleSave() {
    setSaved(false)
    start(async () => {
      const res = await saveInvoiceSettings(form)
      if (res.success) setSaved(true)
    })
  }

  return (
    <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-white/[0.06]">
        <h2 className="text-white font-bold text-sm">تنظیمات سربرگ فاکتور</h2>
        <p className="text-white/40 text-xs mt-0.5">این اطلاعات روی تمام فاکتورهای صادره نمایش داده می‌شوند</p>
      </div>
      <div className="p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="نام حقوقی شرکت / فروشگاه">
            <input value={form.invoice_company_name} onChange={(e) => set('invoice_company_name', e.target.value)}
              placeholder="بیواز" className={inputCls} />
          </Field>
          <Field label="شناسه ملی">
            <input value={form.invoice_national_id} onChange={(e) => set('invoice_national_id', e.target.value)}
              placeholder="14XXXXXXXXX" className={inputCls} dir="ltr" />
          </Field>
          <Field label="کد اقتصادی">
            <input value={form.invoice_economic_code} onChange={(e) => set('invoice_economic_code', e.target.value)}
              placeholder="411XXXXXXXXX14" className={inputCls} dir="ltr" />
          </Field>
          <Field label="شماره ثبت">
            <input value={form.invoice_registration_no} onChange={(e) => set('invoice_registration_no', e.target.value)}
              placeholder="XXXXXXXXX" className={inputCls} dir="ltr" />
          </Field>
          <Field label="شماره تلفن">
            <input value={form.invoice_phone} onChange={(e) => set('invoice_phone', e.target.value)}
              placeholder="021-XXXXXXXX" className={inputCls} dir="ltr" />
          </Field>
          <Field label="کد پستی دفتر">
            <input value={form.invoice_postal_code} onChange={(e) => set('invoice_postal_code', e.target.value)}
              placeholder="XXXXXXXXXX" className={inputCls} dir="ltr" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="آدرس دقیق">
              <textarea value={form.invoice_address} onChange={(e) => set('invoice_address', e.target.value)}
                rows={2} placeholder="تهران، خیابان ..." className={inputCls} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="متن پاورقی فاکتور" hint="مثلاً: کالای فروخته شده تا ۷ روز قابل مرجوعی است.">
              <textarea value={form.invoice_footer_text} onChange={(e) => set('invoice_footer_text', e.target.value)}
                rows={3} placeholder="شرایط بازگشت کالا و سایر توضیحات..." className={inputCls} />
            </Field>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={pending}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-sm font-bold transition-all flex items-center gap-2"
          >
            {pending && (
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="opacity-75" />
              </svg>
            )}
            {pending ? 'در حال ذخیره...' : 'ذخیره تنظیمات'}
          </button>
          {saved && (
            <span className="flex items-center gap-1.5 text-emerald-400 text-sm">
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" clipRule="evenodd" />
              </svg>
              ذخیره شد
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Client ──────────────────────────────────────────────────────────────

export function InvoicesClient({
  orders,
  settings,
}: {
  orders: InvoiceOrder[]
  settings: InvoiceSettings
}) {
  const [tab, setTab] = useState<'orders' | 'settings'>('orders')

  const tabs = [
    { key: 'orders',   label: 'لیست فاکتورها',      count: orders.length },
    { key: 'settings', label: 'تنظیمات فاکتور',      count: null },
  ] as const

  return (
    <div className="space-y-5">
      {/* Tab bar */}
      <div className="flex items-center gap-1 p-1 bg-white/[0.04] rounded-xl border border-white/[0.06] w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === t.key
                ? 'bg-indigo-600 text-white shadow'
                : 'text-white/50 hover:text-white/80'
            }`}
          >
            {t.label}
            {t.count !== null && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t.key ? 'bg-white/20' : 'bg-white/[0.08]'}`}>
                {t.count.toLocaleString('fa-IR')}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === 'orders'   && <OrdersTab orders={orders} settings={settings} />}
      {tab === 'settings' && <SettingsTab initial={settings} />}
    </div>
  )
}
