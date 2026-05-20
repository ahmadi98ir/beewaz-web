'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { LeadStatusBadge, STATUS_CONFIG } from '@/components/admin/crm/lead-status-badge'
import type { LeadStatus } from '@/components/admin/crm/lead-status-badge'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Lead {
  id: string
  fullName: string | null
  phone: string
  city: string | null
  inquiryType: string | null
  status: LeadStatus
  aiSummary: string | null
  assignedTo: string | null
  contactedAt: string | null
  createdAt: string
  updatedAt: string
}

interface ApiResponse {
  leads: Lead[]
  total: number
  page: number
  counts: Record<string, number>
}

// ── Status tabs ───────────────────────────────────────────────────────────────

const TABS: { key: string; label: string }[] = [
  { key: 'all',       label: 'همه' },
  { key: 'new',       label: 'جدید' },
  { key: 'contacted', label: 'تماس گرفته' },
  { key: 'converted', label: 'تبدیل شده' },
  { key: 'lost',      label: 'از دست رفته' },
]

// ── Kanban Column ─────────────────────────────────────────────────────────────

function KanbanColumn({
  status,
  leads,
  onStatusChange,
}: {
  status: LeadStatus
  leads: Lead[]
  onStatusChange: (id: string, status: LeadStatus) => void
}) {
  const cfg = STATUS_CONFIG[status]

  return (
    <div className="flex flex-col min-w-[240px] flex-1">
      {/* Column header */}
      <div className={`flex items-center justify-between mb-3 px-3 py-2 rounded-xl border ${cfg.cls}`}>
        <span className="font-bold text-sm">{cfg.label}</span>
        <span className="text-xs font-mono font-bold opacity-70">{leads.length}</span>
      </div>

      {/* Cards */}
      <div className="space-y-3 flex-1">
        {leads.length === 0 && (
          <div className="text-center py-8 text-surface-300 text-xs border-2 border-dashed border-surface-100 rounded-xl">
            خالی
          </div>
        )}
        {leads.map((lead) => (
          <div
            key={lead.id}
            className="bg-white border border-surface-100 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-surface-200 transition-all group"
          >
            {/* Name + phone */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="min-w-0">
                <p className="font-bold text-surface-900 text-sm truncate">
                  {lead.fullName ?? 'ناشناس'}
                </p>
                <p className="text-xs text-surface-400 font-mono mt-0.5" dir="ltr">{lead.phone}</p>
              </div>
              <Link
                href={`/admin/leads/${lead.id}`}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-brand-600 hover:text-brand-700 flex-shrink-0"
              >
                <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor">
                  <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                  <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                </svg>
              </Link>
            </div>

            {/* City + type */}
            {(lead.city || lead.inquiryType) && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {lead.city && (
                  <span className="text-xs bg-surface-50 text-surface-500 px-2 py-0.5 rounded-lg border border-surface-100">
                    📍 {lead.city}
                  </span>
                )}
                {lead.inquiryType && (
                  <span className="text-xs bg-surface-50 text-surface-500 px-2 py-0.5 rounded-lg border border-surface-100">
                    {lead.inquiryType}
                  </span>
                )}
              </div>
            )}

            {/* Date */}
            <p className="text-xs text-surface-300 mb-3">
              {new Intl.DateTimeFormat('fa-IR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(lead.createdAt))}
            </p>

            {/* Quick status change */}
            <div className="flex gap-1 flex-wrap">
              {(Object.keys(STATUS_CONFIG) as LeadStatus[])
                .filter((s) => s !== status)
                .map((s) => (
                  <button
                    key={s}
                    onClick={() => onStatusChange(lead.id, s)}
                    className="text-xs text-surface-400 hover:text-surface-700 px-1.5 py-0.5 rounded-lg hover:bg-surface-50 transition-colors border border-transparent hover:border-surface-100"
                    title={`تغییر به: ${STATUS_CONFIG[s].label}`}
                  >
                    → {STATUS_CONFIG[s].label}
                  </button>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function LeadsPage() {
  const [data, setData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [view, setView] = useState<'table' | 'kanban'>('table')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [updating, setUpdating] = useState<string | null>(null)
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Fetch ───────────────────────────────────────────────────────
  const fetchLeads = useCallback(async (status: string, q: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ status, limit: '200' })
      if (q) params.set('q', q)
      const res  = await fetch(`/api/admin/leads?${params}`)
      const json = await res.json() as ApiResponse
      setData(json)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLeads(activeTab, search)
  }, [fetchLeads, activeTab, search])

  // ── Debounced search ────────────────────────────────────────────
  const handleSearch = (val: string) => {
    setSearchInput(val)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => setSearch(val), 400)
  }

  // ── Status change ───────────────────────────────────────────────
  const handleStatusChange = async (id: string, status: LeadStatus) => {
    setUpdating(id)
    try {
      await fetch(`/api/admin/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      await fetchLeads(activeTab, search)
    } catch {
      // ignore
    } finally {
      setUpdating(null)
    }
  }

  const leads = data?.leads ?? []
  const counts = data?.counts ?? {}

  // ── Kanban groups ───────────────────────────────────────────────
  const kanbanGroups = (Object.keys(STATUS_CONFIG) as LeadStatus[]).map((s) => ({
    status: s,
    leads:  leads.filter((l) => l.status === s),
  }))

  return (
    <div className="flex-1 overflow-y-auto">
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="bg-white border-b border-surface-200 px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-black text-surface-900">مدیریت لیدها</h1>
            <p className="text-xs text-surface-400 mt-0.5">
              {(counts.all ?? 0).toLocaleString('fa-IR')} لید ثبت شده
            </p>
          </div>
          <button
            onClick={() => setAddOpen(true)}
            className="btn btn-primary flex items-center gap-2 text-sm py-2.5 px-4"
          >
            <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            لید جدید
          </button>
        </div>
      </header>

      <div className="p-6 space-y-5">
        {/* ── Stats row ──────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {(Object.entries(STATUS_CONFIG) as [LeadStatus, typeof STATUS_CONFIG[LeadStatus]][]).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`rounded-2xl border p-4 text-start transition-all ${
                activeTab === key
                  ? `${cfg.cls} shadow-sm`
                  : 'bg-white border-surface-100 hover:border-surface-200'
              }`}
            >
              <p className={`text-2xl font-black ${activeTab === key ? '' : 'text-surface-900'}`}>
                {(counts[key] ?? 0).toLocaleString('fa-IR')}
              </p>
              <p className={`text-xs mt-1 ${activeTab === key ? 'opacity-70' : 'text-surface-400'}`}>
                {cfg.label}
              </p>
            </button>
          ))}
        </div>

        {/* ── Toolbar ────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status tabs */}
          <div className="flex items-center bg-surface-50 border border-surface-100 rounded-xl p-1 gap-0.5">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === tab.key
                    ? 'bg-white text-surface-900 shadow-sm border border-surface-100'
                    : 'text-surface-500 hover:text-surface-700'
                }`}
              >
                {tab.label}
                {counts[tab.key] !== undefined && (
                  <span className="mr-1.5 opacity-60">
                    {(counts[tab.key] ?? 0).toLocaleString('fa-IR')}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Search */}
          <div className="relative">
            <svg viewBox="0 0 20 20" className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="جستجو نام، تلفن، شهر..."
              className="pr-9 pl-4 py-2 text-sm bg-white border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 w-56 transition-all"
            />
          </div>

          {/* View toggle */}
          <div className="flex items-center bg-surface-50 border border-surface-100 rounded-xl p-1">
            <button
              onClick={() => setView('table')}
              className={`p-1.5 rounded-lg transition-all ${view === 'table' ? 'bg-white shadow-sm' : 'text-surface-400 hover:text-surface-600'}`}
              title="نمای جدول"
            >
              <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor">
                <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              onClick={() => setView('kanban')}
              className={`p-1.5 rounded-lg transition-all ${view === 'kanban' ? 'bg-white shadow-sm' : 'text-surface-400 hover:text-surface-600'}`}
              title="نمای کانبان"
            >
              <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor">
                <path d="M2 4a1 1 0 011-1h4a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V4zM8 4a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H9a1 1 0 01-1-1V4zM15 4a1 1 0 011-1h1a1 1 0 011 1v5a1 1 0 01-1 1h-1a1 1 0 01-1-1V4z" />
              </svg>
            </button>
          </div>

          {/* Refresh */}
          <button
            onClick={() => fetchLeads(activeTab, search)}
            disabled={loading}
            className="p-2 rounded-xl border border-surface-100 text-surface-400 hover:text-surface-700 hover:bg-surface-50 transition-all disabled:opacity-40"
            title="بروزرسانی"
          >
            <svg viewBox="0 0 20 20" className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* ── Loading state ───────────────────────────────────────── */}
        {loading && !data && (
          <div className="flex items-center justify-center py-20 text-surface-300">
            <svg viewBox="0 0 20 20" className="w-6 h-6 animate-spin ml-2" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            در حال بارگذاری...
          </div>
        )}

        {/* ── TABLE VIEW ─────────────────────────────────────────── */}
        {!loading || data ? (
          view === 'table' ? (
            <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
              {leads.length === 0 ? (
                <div className="py-20 text-center">
                  <div className="w-16 h-16 bg-surface-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg viewBox="0 0 20 20" className="w-8 h-8 text-surface-300" fill="currentColor">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                  </div>
                  <p className="text-surface-400 font-semibold">لیدی یافت نشد</p>
                  <p className="text-surface-300 text-sm mt-1">فیلتر یا جستجو را تغییر دهید</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-surface-50 border-b border-surface-100">
                      <tr>
                        {['نام', 'تلفن', 'شهر', 'نوع درخواست', 'وضعیت', 'تاریخ', 'عملیات'].map((h) => (
                          <th key={h} className="text-start px-5 py-3 text-xs font-bold text-surface-500">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-50">
                      {leads.map((lead) => (
                        <tr
                          key={lead.id}
                          className={`hover:bg-surface-50 transition-colors ${updating === lead.id ? 'opacity-50' : ''}`}
                        >
                          {/* نام */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center text-brand-700 font-black text-sm flex-shrink-0">
                                {(lead.fullName ?? lead.phone)[0]}
                              </div>
                              <div>
                                <p className="font-semibold text-surface-900">{lead.fullName ?? <span className="text-surface-400 italic text-xs">ناشناس</span>}</p>
                                {lead.aiSummary && (
                                  <p className="text-xs text-surface-400 truncate max-w-[160px]" title={lead.aiSummary}>
                                    {lead.aiSummary.slice(0, 40)}…
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          {/* تلفن */}
                          <td className="px-5 py-3.5">
                            <a
                              href={`tel:${lead.phone}`}
                              className="font-mono text-brand-600 hover:text-brand-700 hover:underline"
                              dir="ltr"
                            >
                              {lead.phone}
                            </a>
                          </td>
                          {/* شهر */}
                          <td className="px-5 py-3.5 text-surface-500">{lead.city ?? '—'}</td>
                          {/* نوع */}
                          <td className="px-5 py-3.5 text-surface-500">{lead.inquiryType ?? '—'}</td>
                          {/* وضعیت */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              <LeadStatusBadge status={lead.status} />
                              <div className="relative group">
                                <button className="p-1 rounded-lg hover:bg-surface-100 text-surface-300 hover:text-surface-600 transition-colors">
                                  <svg viewBox="0 0 20 20" className="w-3.5 h-3.5" fill="currentColor">
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                  </svg>
                                </button>
                                <div className="absolute right-0 top-7 bg-white border border-surface-200 rounded-xl shadow-lg py-1 min-w-[140px] z-10 hidden group-hover:block">
                                  {(Object.keys(STATUS_CONFIG) as LeadStatus[]).map((s) => (
                                    <button
                                      key={s}
                                      onClick={() => handleStatusChange(lead.id, s)}
                                      className={`w-full text-start px-3 py-2 text-xs hover:bg-surface-50 flex items-center gap-2 transition-colors ${s === lead.status ? 'font-bold' : ''}`}
                                    >
                                      <span className={`w-2 h-2 rounded-full ${STATUS_CONFIG[s].dot}`} />
                                      {STATUS_CONFIG[s].label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </td>
                          {/* تاریخ */}
                          <td className="px-5 py-3.5 text-surface-400 text-xs">
                            {new Intl.DateTimeFormat('fa-IR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(lead.createdAt))}
                          </td>
                          {/* عملیات */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-1">
                              <Link
                                href={`/admin/leads/${lead.id}`}
                                className="p-1.5 rounded-lg hover:bg-brand-50 text-surface-400 hover:text-brand-600 transition-colors"
                                title="مشاهده پرونده"
                              >
                                <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor">
                                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                </svg>
                              </Link>
                              <a
                                href={`tel:${lead.phone}`}
                                className="p-1.5 rounded-lg hover:bg-green-50 text-surface-400 hover:text-green-600 transition-colors"
                                title="تماس"
                              >
                                <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor">
                                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                </svg>
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            /* ── KANBAN VIEW ─────────────────────────────────────── */
            <div className="flex gap-4 overflow-x-auto pb-4">
              {kanbanGroups.map(({ status, leads: colLeads }) => (
                <KanbanColumn
                  key={status}
                  status={status}
                  leads={colLeads}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )
        ) : null}
      </div>

      {/* ── Add Lead Modal ──────────────────────────────────────────── */}
      {addOpen && (
        <AddLeadModal
          onClose={() => setAddOpen(false)}
          onSaved={() => { setAddOpen(false); fetchLeads(activeTab, search) }}
        />
      )}
    </div>
  )
}

// ── Add Lead Modal ────────────────────────────────────────────────────────────

function AddLeadModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ fullName: '', phone: '', city: '', inquiryType: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.phone.trim()) { setError('شماره تلفن الزامی است'); return }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/admin/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const j = await res.json() as { error?: string }
        setError(j.error ?? 'خطا در ذخیره')
      } else {
        onSaved()
      }
    } catch {
      setError('خطا در ارتباط با سرور')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 m-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-black text-surface-900">لید جدید</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-surface-100 text-surface-400 hover:text-surface-700 transition-colors">
            <svg viewBox="0 0 20 20" className="w-5 h-5" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-surface-600 mb-1.5">نام و نام خانوادگی</label>
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              placeholder="علی محمدی"
              className="w-full px-3.5 py-2.5 text-sm border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-surface-600 mb-1.5">شماره تلفن <span className="text-red-500">*</span></label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="09121234567"
              dir="ltr"
              className="w-full px-3.5 py-2.5 text-sm border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-300 font-mono"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-surface-600 mb-1.5">شهر</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="تهران"
                className="w-full px-3.5 py-2.5 text-sm border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-surface-600 mb-1.5">نوع درخواست</label>
              <select
                value={form.inquiryType}
                onChange={(e) => setForm({ ...form, inquiryType: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-300 bg-white"
              >
                <option value="">انتخاب...</option>
                <option value="خانگی">خانگی</option>
                <option value="تجاری">تجاری</option>
                <option value="پارکینگ">پارکینگ</option>
                <option value="ویلا">ویلا</option>
              </select>
            </div>
          </div>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 btn btn-outline py-2.5">
              انصراف
            </button>
            <button type="submit" disabled={saving} className="flex-1 btn btn-primary py-2.5 disabled:opacity-50">
              {saving ? 'در حال ذخیره...' : 'ذخیره لید'}
            </button>
          </div>
        </form>
      </div>
    </div>