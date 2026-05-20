'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
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
  sessionId: string | null
  createdAt: string
  updatedAt: string
}

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  createdAt: string
}

interface ApiResponse {
  lead: Lead
  messages: Message[]
}

// ── Status pipeline ───────────────────────────────────────────────────────────

const STATUS_ORDER: LeadStatus[] = ['new', 'contacted', 'converted', 'lost']

function StatusPipeline({
  current,
  onChange,
  saving,
}: {
  current: LeadStatus
  onChange: (s: LeadStatus) => void
  saving: boolean
}) {
  const isLost = current === 'lost'

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {STATUS_ORDER.filter((s) => s !== 'lost').map((s, i, arr) => {
          const cfg        = STATUS_CONFIG[s]
          const currentIdx = STATUS_ORDER.indexOf(current)
          const stepIdx    = STATUS_ORDER.indexOf(s)
          const isActive   = s === current && !isLost
          const isPast     = currentIdx > stepIdx && !isLost
          const isFuture   = currentIdx < stepIdx

          return (
            <div key={s} className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => onChange(s)}
                disabled={saving || s === current}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                  isActive
                    ? `${cfg.cls} shadow-sm`
                    : isPast
                      ? 'bg-surface-50 text-surface-400 border-surface-100 hover:bg-surface-100'
                      : 'bg-white text-surface-400 border-surface-200 hover:bg-surface-50 disabled:opacity-40'
                } disabled:cursor-default`}
              >
                {isPast && (
                  <svg viewBox="0 0 20 20" className="w-3.5 h-3.5 text-green-500" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {isActive && <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />}
                {cfg.label}
              </button>
              {i < arr.length - 1 && (
                <svg viewBox="0 0 20 20" className="w-4 h-4 text-surface-200 flex-shrink-0 rotate-180" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          )
        })}
      </div>

      {/* Lost button separate */}
      <button
        onClick={() => onChange('lost')}
        disabled={saving || current === 'lost'}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-all ${
          isLost
            ? 'bg-red-50 text-red-600 border-red-200'
            : 'bg-white text-surface-400 border-surface-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200'
        } disabled:cursor-default disabled:opacity-70`}
      >
        <svg viewBox="0 0 20 20" className="w-3.5 h-3.5" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
        از دست رفته
      </button>
    </div>
  )
}

// ── Chat bubble ───────────────────────────────────────────────────────────────

function ChatBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
        isUser
          ? 'bg-brand-600 text-white rounded-br-sm'
          : 'bg-surface-50 border border-surface-100 text-surface-700 rounded-bl-sm'
      }`}>
        <p className="leading-relaxed">{msg.content}</p>
        <p className={`text-xs mt-1 ${isUser ? 'text-white/60' : 'text-surface-400'}`}>
          {new Intl.DateTimeFormat('fa-IR', { hour: '2-digit', minute: '2-digit' }).format(new Date(msg.createdAt))}
        </p>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router  = useRouter()
  const [data, setData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editForm, setEditForm] = useState<Partial<Lead>>({})
  const [saveMsg, setSaveMsg] = useState('')

  // ── Fetch ───────────────────────────────────────────────────────
  const fetchLead = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch(`/api/admin/leads/${id}`)
      const json = await res.json() as ApiResponse
      setData(json)
      setEditForm({
        fullName:    json.lead.fullName    ?? '',
        city:        json.lead.city        ?? '',
        inquiryType: json.lead.inquiryType ?? '',
        aiSummary:   json.lead.aiSummary   ?? '',
      })
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchLead()
  }, [fetchLead])

  // ── Status change ───────────────────────────────────────────────
  const handleStatusChange = async (status: LeadStatus) => {
    if (!data) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const json = await res.json() as { lead: Lead }
      setData((prev) => prev ? { ...prev, lead: json.lead } : prev)
      setSaveMsg('وضعیت با موفقیت تغییر یافت')
      setTimeout(() => setSaveMsg(''), 3000)
    } catch {
      // ignore
    } finally {
      setSaving(false)
    }
  }

  // ── Save edits ──────────────────────────────────────────────────
  const handleSaveEdit = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      const json = await res.json() as { lead: Lead }
      setData((prev) => prev ? { ...prev, lead: json.lead } : prev)
      setEditMode(false)
      setSaveMsg('اطلاعات با موفقیت ذخیره شد')
      setTimeout(() => setSaveMsg(''), 3000)
    } catch {
      // ignore
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-surface-300">
          <svg viewBox="0 0 20 20" className="w-8 h-8 animate-spin mx-auto mb-3" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
          در حال بارگذاری...
        </div>
      </div>
    )
  }

  if (!data?.lead) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-surface-500 font-semibold">لید یافت نشد</p>
          <Link href="/admin/leads" className="btn btn-outline mt-4 text-sm">
            بازگشت به لیست
          </Link>
        </div>
      </div>
    )
  }

  const { lead, messages } = data
  const userMessages = messages.filter((m) => m.role !== 'system')

  return (
    <div className="flex-1 overflow-y-auto">
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="bg-white border-b border-surface-200 px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/leads"
              className="p-2 rounded-xl hover:bg-surface-100 text-surface-400 hover:text-surface-700 transition-colors"
            >
              <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </Link>
            <div>
              <h1 className="text-lg font-black text-surface-900">
                {lead.fullName ?? 'مشتری ناشناس'}
              </h1>
              <p className="text-xs text-surface-400 mt-0.5 font-mono" dir="ltr">{lead.phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LeadStatusBadge status={lead.status} />
            <a
              href={`tel:${lead.phone}`}
              className="btn btn-primary flex items-center gap-2 text-sm py-2.5 px-4"
            >
              <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              تماس
            </a>
          </div>
        </div>
      </header>

      {/* ── Save confirmation toast ─────────────────────────────── */}
      {saveMsg && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold flex items-center gap-2">
          <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          {saveMsg}
        </div>
      )}

      <div className="p-6">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-5 gap-6">

          {/* ── Left column: Profile + Status ───────────────────── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Profile card */}
            <div className="bg-white rounded-2xl border border-surface-200 p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-surface-900">اطلاعات لید</h3>
                <button
                  onClick={() => setEditMode((v) => !v)}
                  className="p-1.5 rounded-xl hover:bg-surface-100 text-surface-400 hover:text-surface-700 transition-colors"
                  title="ویرایش"
                >
                  <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
              </div>

              {/* Avatar */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center text-brand-700 font-black text-2xl">
                  {(lead.fullName ?? lead.phone)[0]?.toUpperCase() ?? '?'}
                </div>
                <div>
                  {editMode ? (
                    <input
                      type="text"
                      value={editForm.fullName ?? ''}
                      onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                      placeholder="نام کامل"
                      className="font-bold text-surface-900 w-full px-2 py-1 border-b border-brand-300 focus:outline-none text-base bg-transparent"
                    />
                  ) : (
                    <p className="font-bold text-surface-900 text-lg">{lead.fullName ?? 'ناشناس'}</p>
                  )}
                  <a href={`tel:${lead.phone}`} className="text-sm text-brand-600 hover:underline font-mono" dir="ltr">
                    {lead.phone}
                  </a>
                </div>
              </div>

              {/* Fields */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg viewBox="0 0 20 20" className="w-4 h-4 text-surface-400" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-surface-400 mb-0.5">شهر</p>
                    {editMode ? (
                      <input
                        type="text"
                        value={editForm.city ?? ''}
                        onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                        placeholder="تهران"
                        className="text-sm font-semibold text-surface-700 w-full px-2 py-0.5 border-b border-brand-300 focus:outline-none bg-transparent"
                      />
                    ) : (
                      <p className="text-sm font-semibold text-surface-700">{lead.city ?? '—'}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg viewBox="0 0 20 20" className="w-4 h-4 text-surface-400" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-surface-400 mb-0.5">نوع درخواست</p>
                    {editMode ? (
                      <select
                        value={editForm.inquiryType ?? ''}
                        onChange={(e) => setEditForm({ ...editForm, inquiryType: e.target.value })}
                        className="text-sm font-semibold text-surface-700 w-full px-2 py-0.5 border-b border-brand-300 focus:outline-none bg-transparent"
                      >
                        <option value="">انتخاب...</option>
                        <option value="خانگی">خانگی</option>
                        <option value="تجاری">تجاری</option>
                        <option value="پارکینگ">پارکینگ</option>
                        <option value="ویلا">ویلا</option>
                      </select>
                    ) : (
                      <p className="text-sm font-semibold text-surface-700">{lead.inquiryType ?? '—'}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg viewBox="0 0 20 20" className="w-4 h-4 text-surface-400" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-surface-400 mb-0.5">تاریخ ثبت</p>
                    <p className="text-sm font-semibold text-surface-700">
                      {new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(lead.createdAt))}
                    </p>
                  </div>
                </div>

                {lead.contactedAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg viewBox="0 0 20 20" className="w-4 h-4 text-amber-500" fill="currentColor">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-surface-400 mb-0.5">تاریخ تماس</p>
                      <p className="text-sm font-semibold text-surface-700">
                        {new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(lead.contactedAt))}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Edit actions */}
              {editMode && (
                <div className="flex gap-2 mt-5 pt-4 border-t border-surface-100">
                  <button
                    onClick={() => setEditMode(false)}
                    className="flex-1 btn btn-outline text-sm py-2"
                  >
                    انصراف
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={saving}
                    className="flex-1 btn btn-primary text-sm py-2 disabled:opacity-50"
                  >
                    {saving ? 'ذخیره...' : 'ذخیره'}
                  </button>
                </div>
              )}
            </div>

            {/* Status pipeline */}
            <div className="bg-white rounded-2xl border border-surface-200 p-6">
              <h3 className="font-bold text-surface-900 mb-4">مرحله فروش</h3>
              <StatusPipeline
                current={lead.status}
                onChange={handleStatusChange}
                saving={saving}
              />
            </div>

            {/* Lead ID card */}
            <div className="bg-surface-50 rounded-2xl border border-surface-100 p-4">
              <p className="text-xs text-surface-400 mb-1">شناسه لید</p>
              <p className="text-xs font-mono text-surface-500 break-all">{lead.id}</p>
            </div>
          </div>

          {/* ── Right column: AI Summary + Chat History ─────────── */}
          <div className="lg:col-span-3 space-y-5">

            {/* AI Summary */}
            {(lead.aiSummary || editMode) && (
              <div className="bg-white rounded-2xl border border-surface-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center">
                    <svg viewBox="0 0 20 20" className="w-4 h-4 text-violet-500" fill="currentColor">
                      <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                      <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-surface-900">خلاصه هوش مصنوعی</h3>
                  <span className="text-xs bg-violet-50 text-violet-600 border border-violet-200 px-2 py-0.5 rounded-full">AI</span>
                </div>
                {editMode ? (
                  <textarea
                    value={editForm.aiSummary ?? ''}
                    onChange={(e) => setEditForm({ ...editForm, aiSummary: e.target.value })}
                    placeholder="خلاصه مکالمه و نیاز مشتری..."
                    rows={4}
                    className="w-full text-sm text-surface-700 leading-relaxed border border-surface-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-brand-300 resize-none"
                  />
                ) : (
                  <p className="text-sm text-surface-700 leading-relaxed">
                    {lead.aiSummary}
                  </p>
                )}
              </div>
            )}

            {/* Chat history */}
            {userMessages.length > 0 ? (
              <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between">
                  <h3 className="font-bold text-surface-900">تاریخچه مکالمه</h3>
                  <span className="text-xs text-surface-400 bg-surface-50 border border-surface-100 px-2.5 py-1 rounded-full">
                    {userMessages.length.toLocaleString('fa-IR')} پیام
                  </span>
                </div>
                <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
                  {userMessages.map((msg, i) => (
                    <ChatBubble key={i} msg={msg} />
                  ))}
                </div>
              </div>
            ) : (
              /* No chat — show empty state */
              <div className="bg-white rounded-2xl border border-surface-200 p-8 text-center">
                <div className="w-14 h-14 bg-surface-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <svg viewBox="0 0 20 20" className="w-7 h-7 text-surface-300" fill="currentColor">
                    <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-surface-400 text-sm font-semibold">تاریخچه مکالمه‌ای موجود نیست</p>
                <p className="text-surface-300 text-xs mt-1">این لید از طریق چت‌بات ثبت نشده</p>
              </div>
            )}

            {/* Quick actions */}
            <div className="bg-white rounded-2xl border border-surface-200 p-6">
              <h3 className="font-bold text-surface-900 mb-4">اقدامات سریع</h3>
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={`tel:${lead.phone}`}
                  className="flex items-center gap-3 p-3 rounded-xl border border-surface-100 hover:bg-green-50 hover:border-green-200 transition-all group"
                >
                  <div className="w-9 h-9 rounded-xl bg-green-50 group-hover:bg-green-100 flex items-center justify-center transition-colors">
                    <svg viewBox="0 0 20 20" className="w-4 h-4 text-green-600" fill="currentColor">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-surface-900">تماس تلفنی</p>
                    <p className="text-xs text-surface-400">{lead.phone}</p>
                  </div>
                </a>

                <a
                  href={`https://wa.me/98${lead.phone.replace(/^0/, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl border border-surface-100 hover:bg-green-50 hover:border-green-200 transition-all group"
                >
                  <div className="w-9 h-9 rounded-xl bg-green-50 group-hover:bg-green-100 flex items-center justify-center transition-colors">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 text-green-600" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                      <path d="M11.54.037C5.33.037.28 5.087.28 11.297c0 1.988.518 3.856 1.416 5.48L.001 22.556l5.974-1.67a10.994 10.994 0 005.565 1.503h.005C17.75 22.389 22.8 17.34 22.8 11.13 22.8 4.918 17.75-.033 11.54-.033v.07z" fillRule="evenodd" clipRule="evenodd" opacity=".3"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-surface-900">واتس‌اپ</p>
                    <p className="text-xs text-surface-400">پیام مستقیم</p>
                  </div>
                </a>

                <button
                  onClick={() => handleStatusChange('contacted')}
                  disabled={saving || lead.status === 'contacted' || lead.status === 'converted'}
                  className="flex items-center gap-3 p-3 rounded-xl border border-surface-100 hover:bg-amber-50 hover:border-amber-200 transition-all group disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-50 group-hover:bg-amber-100 flex items-center justify-center transition-colors">
                    <svg viewBox="0 0 20 20" className="w-4 h-4 text-amber-600" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="text-start">
                    <p className="text-sm font-bold text-surface-900">ثبت تماس</p>
                    <p className="text-xs text-surface-400">تغییر به «تماس گرفته»</p>
                  </div>
                </button>

                <button
                  onClick={() => handleStatusChange('converted')}
                  disabled={saving || lead.status === 'converted'}
                  className="flex items-center gap-3 p-3 rounded-xl border border-surface-100 hover:bg-green-50 hover:border-green-200 transition-all group disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <div className="w-9 h-9 rounded-xl bg-green-50 group-hover:bg-green-100 flex items-center justify-center transition-colors">
                    <svg viewBox="0 0 20 20" className="w-4 h-4 text-green-600" fill="currentColor">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="text-start">
                    <p className="text-sm font-bold text-surface-900">تبدیل به مشتری</p>
                    <p className="text-xs text-surface-400">فروش موفق بود</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
