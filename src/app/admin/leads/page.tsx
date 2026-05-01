'use client'

import { useState } from 'react'
import { mockLeads } from '@/lib/mock-admin-data'
import type { AdminLead } from '@/lib/mock-admin-data'
import { PhoneIcon, SearchIcon } from '@/components/ui/icons'

type Status = AdminLead['status'] | 'all'

const statusConfig: Record<AdminLead['status'], { label: string; cls: string }> = {
  new:       { label: 'جدید',         cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  contacted: { label: 'تماس گرفته',  cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  converted: { label: 'تبدیل شده',  cls: 'bg-green-50 text-green-700 border-green-200' },
  lost:      { label: 'از دست رفته', cls: 'bg-red-50 text-red-700 border-red-200' },
}

function StatusBadge({ status }: { status: AdminLead['status'] }) {
  const s = statusConfig[status]
  return <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold border ${s.cls}`}>{s.label}</span>
}

export default function LeadsPage() {
  const [filter, setFilter] = useState<Status>('all')
  const [search, setSearch] = useState('')
  const [leads, setLeads] = useState(mockLeads)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const counts = {
    all: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    converted: leads.filter(l => l.status === 'converted').length,
    lost: leads.filter(l => l.status === 'lost').length,
  }

  const filtered = leads.filter((l) => {
    const matchStatus = filter === 'all' || l.status === filter
    const matchSearch = !search || l.phone.includes(search) || l.fullName?.includes(search) || l.city?.includes(search)
    return matchStatus && matchSearch
  })

  const updateStatus = (id: string, status: AdminLead['status']) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l))
  }

  const tabs: { key: Status; label: string }[] = [
    { key: 'all', label: `همه (${counts.all})` },
    { key: 'new', label: `جدید (${counts.new})` },
    { key: 'contacted', label: `تماس گرفته (${counts.contacted})` },
    { key: 'converted', label: `تبدیل شده (${counts.converted})` },
    { key: 'lost', label: `از دست رفته (${counts.lost})` },
  ]

  return (
    <div className="flex-1 overflow-y-auto">
      <header className="bg-white border-b border-surface-200 px-6 py-4">
        <h1 className="text-lg font-black text-surface-900">مدیریت لیدها</h1>
        <p className="text-xs text-surface-400 mt-0.5">لیدهای دریافت‌شده از چت‌بات و فرم‌های سایت</p>
      </header>

      <div className="p-6 space-y-5">
        {/* Tabs + Search */}
        <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
          <div className="flex items-center justify-between gap-4 p-4 border-b border-surface-100 flex-wrap">
            <div className="flex gap-0.5 bg-surface-50 p-1 rounded-xl flex-wrap">
              {tabs.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === key ? 'bg-white text-surface-900 shadow-sm border border-surface-200' : 'text-surface-500 hover:text-surface-700'}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="relative">
              <SearchIcon size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-surface-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="جستجو در لیدها..."
                className="ps-9 pe-4 py-2 text-sm border border-surface-200 rounded-xl w-52 focus:outline-none focus:border-brand-600 transition-colors"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-50 text-surface-500 text-xs">
                <tr>
                  {['نام / موبایل', 'شهر', 'نوع نیاز', 'بودجه', 'وضعیت', 'تاریخ', 'اقدام'].map(h => (
                    <th key={h} className="text-start px-5 py-3 font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {filtered.map((lead) => (
                  <>
                    <tr
                      key={lead.id}
                      className="hover:bg-surface-50 transition-colors cursor-pointer"
                      onClick={() => setExpandedId(expandedId === lead.id ? null : lead.id)}
                    >
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-surface-900">{lead.fullName ?? <span className="text-surface-400 font-normal">بدون نام</span>}</p>
                        <p className="text-xs font-mono text-surface-400 mt-0.5" dir="ltr">{lead.phone}</p>
                      </td>
                      <td className="px-5 py-3.5 text-surface-600">{lead.city ?? '—'}</td>
                      <td className="px-5 py-3.5 text-surface-600">{lead.inquiryType ?? '—'}</td>
                      <td className="px-5 py-3.5 text-surface-600">{lead.budget ?? '—'}</td>
                      <td className="px-5 py-3.5"><StatusBadge status={lead.status} /></td>
                      <td className="px-5 py-3.5 text-surface-400 text-xs whitespace-nowrap">
                        {new Intl.DateTimeFormat('fa-IR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(lead.createdAt))}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <a
                            href={`tel:${lead.phone}`}
                            onClick={e => e.stopPropagation()}
                            className="w-8 h-8 rounded-xl bg-green-50 border border-green-200 text-green-600 flex items-center justify-center hover:bg-green-100 transition-colors"
                            title="تماس"
                          >
                            <PhoneIcon size={14} />
                          </a>
                          <select
                            value={lead.status}
                            onChange={e => { e.stopPropagation(); updateStatus(lead.id, e.target.value as AdminLead['status']) }}
                            onClick={e => e.stopPropagation()}
                            className="text-xs border border-surface-200 rounded-lg px-2 py-1 focus:outline-none focus:border-brand-600 bg-white"
                          >
                            <option value="new">جدید</option>
                            <option value="contacted">تماس گرفته</option>
                            <option value="converted">تبدیل شده</option>
                            <option value="lost">از دست رفته</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                    {/* Expanded Row — AI Summary */}
                    {expandedId === lead.id && lead.aiSummary && (
                      <tr key={`${lead.id}-exp`} className="bg-blue-50/50">
                        <td colSpan={7} className="px-5 py-3">
                          <div className="flex items-start gap-2">
                            <span className="text-xs font-bold text-blue-600 flex-shrink-0 mt-0.5">🤖 خلاصه AI:</span>
                            <p className="text-xs text-blue-800 leading-relaxed">{lead.aiSummary}</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-surface-400 text-sm">لیدی یافت نشد.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
