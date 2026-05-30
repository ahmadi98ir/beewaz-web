'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
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

interface Note {
  id: string
  note: string
  createdAt: string
}

interface Activity {
  id: string
  type: string
  description: string
  createdAt: string
}

type TimelineItem =
  | { kind: 'note'; data: Note }
  | { kind: 'activity'; data: Activity }

interface ApiResponse {
  lead: Lead
  messages: Message[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function faDate(d: string) {
  return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(d))
}

const ACTIVITY_ICONS: Record<string, { icon: string; cls: string }> = {
  call:     { icon: '📞', cls: 'bg-green-50 border-green-200' },
  email:    { icon: '📧', cls: 'bg-blue-50 border-blue-200' },
  meeting:  { icon: '🤝', cls: 'bg-violet-50 border-violet-200' },
  sms:      { icon: '💬', cls: 'bg-amber-50 border-amber-200' },
  note:     { icon: '📝', cls: 'bg-surface-50 border-surface-200' },
  default:  { icon: '🔹', cls: 'bg-surface-50 border-surface-200' },
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

  // notes + activities
  const [notes,      setNotes]      = useState<Note[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [noteText,   setNoteText]   = useState('')
  const [actType,    setActType]    = useState('call')
  const [actDesc,    setActDesc]    = useState('')
  const [addingNote, setAddingNote] = useState(false)
  const [addingAct,  setAddingAct]  = useState(false)
  const [sideTab,    setSideTab]    = useState<'notes' | 'activity'>('notes')
  const noteRef = useRef<HTMLTextAreaElement>(null)

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
    } catch { /* ignore */ } finally {
      setLoading(false)
    }
  }, [id])

  const fetchNotes = useCallback(async () => {
    const r = await fetch(`/api/admin/leads/${id}/notes`)
    if (r.ok) { const d = await r.json() as { notes: Note[] }; setNotes(d.notes) }
  }, [id])

  const fetchActivities = useCallback(async () => {
    const r = await fetch(`/api/admin/leads/${id}/activities`)
    if (r.ok) { const d = await r.json() as { activities: Activity[] }; setActivities(d.activities) }
  }, [id])

  useEffect(() => {
    void fetchLead()
    void fetchNotes()
    void fetchActivities()
  }, [fetchLead, fetchNotes, fetchActivities])

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
    } catch { /* ignore */ } finally {
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
    } catch { /* ignore */ } finally {
      setSaving(false)
    }
  }

  // ── Add note ────────────────────────────────────────────────────
  const addNote = async () => {
    if (!noteText.trim() || addingNote) return
    setAddingNote(true)
    try {
      const r = await fetch(`/api/admin/leads/${id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: noteText.trim() }),
      })
      if (r.ok) {
        const d = await r.json() as { note: Note }
        setNotes((p) => [d.note, ...p])
        setNoteText('')
      }
    } catch { /* ignore */ } finally {
      setAddingNote(false)
    }
  }

  // ── Add activity ────────────────────────────────────────────────
  const addActivity = async () => {
    if (!actDesc.trim() || addingAct) return
    setAddingAct(true)
    try {
      const r = await fetch(`/api/admin/leads/${id}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: actType, description: actDesc.trim() }),
      })
      if (r.ok) {
        const d = await r.json() as { activity: Activity }
        setActivities((p) => [d.activity, ...p])
        setActDesc('')
      }
    } catch { /* ignore */ } finally {
      setAddingAct(false)
    }
  }

  // ── Timeline merge ──────────────────────────────────────────────
  const timeline: TimelineItem[] = [
    ...notes.map((n): TimelineItem => ({ kind: 'note', data: n })),
    ...activities.map((a): TimelineItem => ({ kind: 'activity', data: a })),
  ].sort((a, b) =>
    new Date(b.data.createdAt).getTime() - new Date(a.data.createdAt).getTime()
  )

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

      {/* ── Toast ──────────────────────────────────────────────── */}
      {saveMsg && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold flex items-center gap-2">
          <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          {saveMsg}
        </div>
      )}

      <div className="p-6">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* ── Top grid: profile + chat ─────────────────────── */}
          <div className="grid lg:grid-cols-5 gap-6">

            {/* Left column: Profile + Status */}
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

                {editMode && (
                  <div className="flex gap-2 mt-5 pt-4 border-t border-surface-100">
                    <button onClick={() => setEditMode(false)} className="flex-1 btn btn-outline text-sm py-2">انصراف</button>
                    <button onClick={handleSaveEdit} disabled={saving} className="flex-1 btn btn-primary text-sm py-2 disabled:opacity-50">
                      {saving ? 'ذخیره...' : 'ذخیره'}
                    </button>
                  </div>
                )}
              </div>

              {/* Status pipeline */}
              <div className="bg-white rounded-2xl border border-surface-200 p-6">
                <h3 className="font-bold text-surface-900 mb-4">مرحله فروش</h3>
                <StatusPipeline current={lead.status} onChange={handleStatusChange} saving={saving} />
              </div>

              {/* Quick actions */}
              <div className="bg-white rounded-2xl border border-surface-200 p-5">
                <h3 className="font-bold text-surface-900 mb-3 text-sm">اقدامات سریع</h3>
                <div className="grid grid-cols-2 gap-2">
                  <a href={`tel:${lead.phone}`} className="flex items-center gap-2 p-2.5 rounded-xl border border-surface-100 hover:bg-green-50 hover:border-green-200 transition-all group">
                    <div className="w-7 h-7 rounded-lg bg-green-50 group-hover:bg-green-100 flex items-center justify-center">
                      <svg viewBox="0 0 20 20" className="w-3.5 h-3.5 text-green-600" fill="currentColor">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                    </div>
                    <span className="text-xs font-bold text-surface-900">تماس</span>
                  </a>

                  <a href={`https://wa.me/98${lead.phone.replace(/^0/, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2.5 rounded-xl border border-surface-100 hover:bg-green-50 hover:border-green-200 transition-all group">
                    <div className="w-7 h-7 rounded-lg bg-green-50 group-hover:bg-green-100 flex items-center justify-center text-sm">💬</div>
                    <span className="text-xs font-bold text-surface-900">واتس‌اپ</span>
                  </a>

                  <button
                    onClick={() => { setSideTab('notes'); noteRef.current?.focus() }}
                    className="flex items-center gap-2 p-2.5 rounded-xl border border-surface-100 hover:bg-amber-50 hover:border-amber-200 transition-all group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-50 group-hover:bg-amber-100 flex items-center justify-center text-sm">📝</div>
                    <span className="text-xs font-bold text-surface-900">یادداشت</span>
                  </button>

                  <button
                    onClick={() => handleStatusChange('converted')}
                    disabled={saving || lead.status === 'converted'}
                    className="flex items-center gap-2 p-2.5 rounded-xl border border-surface-100 hover:bg-green-50 hover:border-green-200 transition-all group disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <div className="w-7 h-7 rounded-lg bg-green-50 group-hover:bg-green-100 flex items-center justify-center text-sm">✅</div>
                    <span className="text-xs font-bold text-surface-900">تبدیل</span>
                  </button>
                </div>
              </div>

              {/* Lead ID */}
              <div className="bg-surface-50 rounded-2xl border border-surface-100 p-4">
                <p className="text-xs text-surface-400 mb-1">شناسه لید</p>
                <p className="text-xs font-mono text-surface-500 break-all">{lead.id}</p>
              </div>
            </div>

            {/* Right column: AI Summary + Chat */}
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
                    <p className="text-sm text-surface-700 leading-relaxed">{lead.aiSummary}</p>
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
                  <div className="p-6 space-y-4 max-h-[400px] overflow-y-auto">
                    {userMessages.map((msg, i) => (
                      <ChatBubble key={i} msg={msg} />
                    ))}
                  </div>
                </div>
              ) : (
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
            </div>
          </div>

          {/* ── Bottom: Notes + Activities ────────────────────── */}
          <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100">
              <h3 className="font-bold text-surface-900">یادداشت‌ها و فعالیت‌ها</h3>
              <span className="text-xs text-surface-400">{timeline.length} آیتم</span>
            </div>

            <div className="grid lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x lg:divide-x-reverse divide-surface-100">

              {/* Add panel */}
              <div className="p-5 space-y-4">
                {/* Tab */}
                <div className="flex gap-1 bg-surface-50 rounded-xl p-1">
                  {(['notes', 'activity'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setSideTab(t)}
                      className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${sideTab === t ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-500 hover:text-surface-700'}`}
                    >
                      {t === 'notes' ? '📝 یادداشت' : '📋 فعالیت'}
                    </button>
                  ))}
                </div>

                {sideTab === 'notes' ? (
                  <>
                    <textarea
                      ref={noteRef}
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && e.ctrlKey) void addNote() }}
                      placeholder="یادداشت داخلی..."
                      rows={4}
                      className="input w-full text-sm resize-none"
                    />
                    <button
                      onClick={() => void addNote()}
                      disabled={addingNote || !noteText.trim()}
                      className="btn btn-primary w-full py-2.5 text-sm"
                    >
                      {addingNote ? 'در حال ذخیره...' : 'ذخیره یادداشت'}
                    </button>
                    <p className="text-xs text-surface-400 text-center">Ctrl+Enter برای ذخیره سریع</p>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-surface-500 mb-1.5">نوع فعالیت</label>
                      <select
                        value={actType}
                        onChange={(e) => setActType(e.target.value)}
                        className="input w-full text-sm"
                      >
                        <option value="call">📞 تماس تلفنی</option>
                        <option value="email">📧 ایمیل</option>
                        <option value="meeting">🤝 جلسه</option>
                        <option value="sms">💬 پیامک</option>
                        <option value="note">📝 سایر</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-surface-500 mb-1.5">توضیح</label>
                      <textarea
                        value={actDesc}
                        onChange={(e) => setActDesc(e.target.value)}
                        placeholder="چه اتفاقی افتاد؟"
                        rows={3}
                        className="input w-full text-sm resize-none"
                      />
                    </div>
                    <button
                      onClick={() => void addActivity()}
                      disabled={addingAct || !actDesc.trim()}
                      className="btn btn-primary w-full py-2.5 text-sm"
                    >
                      {addingAct ? 'در حال ثبت...' : 'ثبت فعالیت'}
                    </button>
                  </>
                )}
              </div>

              {/* Timeline */}
              <div className="lg:col-span-2 p-5">
                {timeline.length === 0 ? (
                  <div className="text-center py-10 text-surface-400">
                    <div className="text-3xl mb-2">📭</div>
                    <p className="text-sm font-semibold">هنوز یادداشت یا فعالیتی ثبت نشده</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-y-auto pe-1">
                    {timeline.map((item) => {
                      if (item.kind === 'note') {
                        return (
                          <div key={`n-${item.data.id}`} className="flex gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-sm">📝</div>
                            <div className="flex-1 bg-amber-50 border border-amber-100 rounded-xl p-3">
                              <p className="text-sm text-surface-800 leading-relaxed">{item.data.note}</p>
                              <p className="text-[10px] text-surface-400 mt-1.5">{faDate(item.data.createdAt)}</p>
                            </div>
                          </div>
                        )
                      }
                      const act = item.data
                      const ic = ACTIVITY_ICONS[act.type] ?? { icon: '🔹', cls: 'bg-surface-50 border-surface-200' }
                      const actLabels: Record<string, string> = {
                        call: 'تماس تلفنی', email: 'ایمیل', meeting: 'جلسه', sms: 'پیامک', note: 'سایر',
                      }
                      return (
                        <div key={`a-${act.id}`} className="flex gap-3">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-xl border flex items-center justify-center text-sm ${ic.cls}`}>
                            {ic.icon}
                          </div>
                          <div className={`flex-1 border rounded-xl p-3 ${ic.cls}`}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-bold text-surface-700">{actLabels[act.type] ?? act.type}</span>
                            </div>
                            <p className="text-sm text-surface-800 leading-relaxed">{act.description}</p>
                            <p className="text-[10px] text-surface-400 mt-1.5">{faDate(act.createdAt)}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
