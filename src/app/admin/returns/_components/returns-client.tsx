'use client'

import { useState, useTransition } from 'react'
import { updateReturnStatus } from '../actions'
import { RETURN_STATUS_LABELS } from './constants'
import type { ReturnStatus } from '@/lib/db/schema'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ReturnRow {
  id:              string
  orderId:         string
  invoiceNumber:   number | null
  status:          ReturnStatus
  reason:          string
  reasonText:      string | null
  adminNotes:      string | null
  requestedAt:     string
  resolvedAt:      string | null
  userName:        string | null
  userPhone:       string | null
  itemProductName: string | null
  itemVariantName: string | null
  itemQuantity:    number | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const REASON_LABELS: Record<string, string> = {
  defective:       'معیوب / خراب',
  wrong_item:      'کالای اشتباه',
  not_as_described:'مطابق توضیحات نیست',
  changed_mind:    'انصراف از خرید',
  other:           'سایر',
}

const STATUS_COLORS: Record<ReturnStatus, string> = {
  pending:  'bg-amber-500/15  text-amber-300  border-amber-500/25',
  approved: 'bg-blue-500/15   text-blue-300   border-blue-500/25',
  rejected: 'bg-red-500/15    text-red-300    border-red-500/25',
  refunded: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
}

function fdate(iso: string) {
  return new Date(iso).toLocaleDateString('fa-IR', { year: 'numeric', month: 'short', day: 'numeric' })
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ReturnStatus }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${STATUS_COLORS[status]}`}>
      {RETURN_STATUS_LABELS[status]}
    </span>
  )
}

// ─── Detail Drawer ────────────────────────────────────────────────────────────

function ReturnDrawer({
  row,
  onClose,
  onUpdated,
}: {
  row: ReturnRow
  onClose: () => void
  onUpdated: (id: string, status: ReturnStatus, notes: string) => void
}) {
  const [status,     setStatus]     = useState<ReturnStatus>(row.status)
  const [adminNotes, setAdminNotes] = useState(row.adminNotes ?? '')
  const [serverErr,  setServerErr]  = useState('')
  const [isPending,  startTransition] = useTransition()
  const [saved,      setSaved]      = useState(false)

  function handleSave() {
    setServerErr('')
    setSaved(false)
    startTransition(async () => {
      const res = await updateReturnStatus(row.id, status, adminNotes)
      if (res.success) {
        onUpdated(row.id, status, adminNotes)
        setSaved(true)
        setTimeout(() => setSaved(false), 2500)
      } else {
        setServerErr(res.error ?? 'خطای ناشناخته')
      }
    })
  }

  return (
    /* ─── Overlay ─────────────────────────────────────────────────────────── */
    <div
      className="fixed inset-0 z-50 flex"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="flex-1 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer panel */}
      <div className="w-full max-w-md bg-[#0d0d1f] border-r border-white/[0.06] flex flex-col overflow-y-auto shadow-2xl" dir="rtl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] sticky top-0 bg-[#0d0d1f]/95 backdrop-blur z-10">
          <div>
            <h2 className="text-white font-bold text-base">جزئیات مرجوعی</h2>
            <p className="text-white/30 text-xs mt-0.5">
              {row.invoiceNumber ? `فاکتور #${row.invoiceNumber}` : `سفارش ${row.orderId.slice(0, 8).toUpperCase()}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/[0.06] hover:bg-white/[0.10] flex items-center justify-center text-white/50 hover:text-white transition-colors"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-5 flex-1">

          {/* اطلاعات مشتری */}
          <Section title="مشتری">
            <InfoRow label="نام" value={row.userName ?? '—'} />
            <InfoRow label="تلفن" value={row.userPhone ?? '—'} dir="ltr" />
            <InfoRow label="تاریخ درخواست" value={fdate(row.requestedAt)} />
            {row.resolvedAt && <InfoRow label="تاریخ رسیدگی" value={fdate(row.resolvedAt)} />}
          </Section>

          {/* کالای مرجوعی */}
          <Section title="کالا">
            <InfoRow label="محصول" value={row.itemProductName ?? '—'} />
            {row.itemVariantName && <InfoRow label="مدل / رنگ" value={row.itemVariantName} />}
            <InfoRow label="تعداد" value={String(row.itemQuantity ?? 1)} />
          </Section>

          {/* دلیل مرجوعی */}
          <Section title="دلیل مرجوعی">
            <div className="px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06]">
              <p className="text-white/80 text-sm font-medium">{REASON_LABELS[row.reason] ?? row.reason}</p>
              {row.reasonText && (
                <p className="text-white/40 text-xs mt-1 leading-5">{row.reasonText}</p>
              )}
            </div>
          </Section>

          {/* مدیریت وضعیت */}
          <Section title="تغییر وضعیت">
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(RETURN_STATUS_LABELS) as ReturnStatus[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    status === s
                      ? STATUS_COLORS[s]
                      : 'bg-white/[0.03] border-white/[0.06] text-white/40 hover:border-white/[0.12] hover:text-white/60'
                  }`}
                >
                  {RETURN_STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </Section>

          {/* یادداشت ادمین */}
          <Section title="یادداشت ادمین (اختیاری)">
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={3}
              placeholder="توضیحات داخلی برای این درخواست..."
              className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/80 text-sm placeholder:text-white/20 focus:outline-none focus:border-indigo-500/40 focus:bg-white/[0.06] resize-none transition-colors"
            />
          </Section>

          {serverErr && (
            <p className="text-xs text-red-400 px-1">{serverErr}</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-white/[0.06] sticky bottom-0 bg-[#0d0d1f]/95 backdrop-blur">
          {saved && (
            <p className="text-xs text-emerald-400 text-center mb-3 flex items-center justify-center gap-1.5">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              ذخیره شد — پیامک ارسال شد
            </p>
          )}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.10] text-white/60 text-sm font-medium transition-colors"
            >
              بستن
            </button>
            <button
              onClick={handleSave}
              disabled={isPending}
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-sm font-bold transition-colors flex items-center justify-center gap-2"
            >
              {isPending && (
                <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                  <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="opacity-75" />
                </svg>
              )}
              {isPending ? 'در حال ذخیره...' : 'ذخیره و ارسال پیامک'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Helper subcomponents ─────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold text-white/25 uppercase tracking-widest">{title}</p>
      {children}
    </div>
  )
}

function InfoRow({ label, value, dir }: { label: string; value: string; dir?: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-white/[0.04] last:border-0">
      <span className="text-xs text-white/35">{label}</span>
      <span className={`text-xs text-white/80 font-medium ${dir === 'ltr' ? 'font-mono' : ''}`} dir={dir}>{value}</span>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

const STATUS_FILTER_OPTIONS = [
  { value: 'all',      label: 'همه' },
  { value: 'pending',  label: 'در انتظار' },
  { value: 'approved', label: 'تأیید شده' },
  { value: 'rejected', label: 'رد شده' },
  { value: 'refunded', label: 'بازپرداخت' },
] as const

export function ReturnsClient({ initialRows }: { initialRows: ReturnRow[] }) {
  const [rows,       setRows]       = useState(initialRows)
  const [filterStatus, setFilter]  = useState<string>('all')
  const [selected,   setSelected]  = useState<ReturnRow | null>(null)

  function onUpdated(id: string, status: ReturnStatus, notes: string) {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status, adminNotes: notes, resolvedAt: ['approved','rejected','refunded'].includes(status) ? new Date().toISOString() : r.resolvedAt }
          : r
      )
    )
    // آپدیت drawer هم
    setSelected((prev) => prev?.id === id ? { ...prev, status, adminNotes: notes } : prev)
  }

  const filtered = filterStatus === 'all'
    ? rows
    : rows.filter((r) => r.status === filterStatus)

  const counts = {
    all:      rows.length,
    pending:  rows.filter((r) => r.status === 'pending').length,
    approved: rows.filter((r) => r.status === 'approved').length,
    rejected: rows.filter((r) => r.status === 'rejected').length,
    refunded: rows.filter((r) => r.status === 'refunded').length,
  }

  return (
    <>
      {/* ─── Filter tabs ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 mb-5">
        {STATUS_FILTER_OPTIONS.map(({ value, label }) => {
          const count = counts[value as keyof typeof counts]
          const active = filterStatus === value
          return (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                active
                  ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300'
                  : 'bg-white/[0.03] border-white/[0.06] text-white/40 hover:border-white/[0.12] hover:text-white/60'
              }`}
            >
              {label}
              <span className={`min-w-[18px] h-[18px] rounded-md flex items-center justify-center text-[10px] font-bold px-1 ${
                active ? 'bg-indigo-500/30 text-indigo-200' : 'bg-white/[0.06] text-white/30'
              }`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* ─── Empty state ─────────────────────────────────────────────────── */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8 text-white/20">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
            </svg>
          </div>
          <p className="text-white/30 text-sm">هیچ درخواست مرجوعی‌ای یافت نشد</p>
        </div>
      )}

      {/* ─── Data Table ──────────────────────────────────────────────────── */}
      {filtered.length > 0 && (
        <div className="rounded-2xl border border-white/[0.06] overflow-hidden">
          {/* Desktop table */}
          <table className="w-full hidden sm:table">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['شماره سفارش', 'مشتری', 'کالا', 'دلیل', 'وضعیت', 'تاریخ', ''].map((h) => (
                  <th key={h} className="text-right text-[10px] font-bold text-white/25 uppercase tracking-wider px-4 py-3 bg-white/[0.02]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                  onClick={() => setSelected(row)}
                >
                  <td className="px-4 py-3.5">
                    <span className="text-xs font-mono text-white/60">
                      {row.invoiceNumber ? `#${row.invoiceNumber}` : row.orderId.slice(0, 8).toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-xs text-white/80 font-medium">{row.userName ?? '—'}</p>
                    {row.userPhone && <p className="text-[10px] text-white/30 font-mono mt-0.5" dir="ltr">{row.userPhone}</p>}
                  </td>
                  <td className="px-4 py-3.5 max-w-[180px]">
                    <p className="text-xs text-white/70 truncate">{row.itemProductName ?? '—'}</p>
                    {row.itemVariantName && <p className="text-[10px] text-white/30 mt-0.5 truncate">{row.itemVariantName}</p>}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs text-white/50">{REASON_LABELS[row.reason] ?? row.reason}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs text-white/35">{fdate(row.requestedAt)}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.10] text-white/60 hover:text-white text-xs font-medium">
                      جزئیات
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile cards */}
          <div className="sm:hidden divide-y divide-white/[0.06]">
            {filtered.map((row) => (
              <div
                key={row.id}
                className="px-4 py-4 space-y-2 cursor-pointer hover:bg-white/[0.02] transition-colors"
                onClick={() => setSelected(row)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-white/60">
                    {row.invoiceNumber ? `#${row.invoiceNumber}` : row.orderId.slice(0, 8).toUpperCase()}
                  </span>
                  <StatusBadge status={row.status} />
                </div>
                <p className="text-sm text-white/80 font-medium">{row.userName ?? '—'}</p>
                <p className="text-xs text-white/50 truncate">{row.itemProductName ?? '—'}</p>
                <p className="text-[10px] text-white/25">{REASON_LABELS[row.reason] ?? row.reason} — {fdate(row.requestedAt)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Drawer ──────────────────────────────────────────────────────── */}
      {selected && (
        <ReturnDrawer
          row={selected}
          onClose={() => setSelected(null)}
          onUpdated={onUpdated}
        />
      )}
    </>
  )
}
