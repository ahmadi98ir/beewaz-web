'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Metadata } from 'next'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Setting {
  key: string
  value: string | null
  type: string
  label: string
  group: string
  hint: string | null
  isRequired: boolean
  isEditable: boolean
}

const GROUP_LABELS: Record<string, string> = {
  general: 'تنظیمات کلی',
  seo: 'سئو و متادیتا',
  contact: 'اطلاعات تماس',
  social: 'شبکه‌های اجتماعی',
  commerce: 'تجارت و فروشگاه',
  notification: 'اطلاع‌رسانی',
}

const GROUP_ICONS: Record<string, string> = {
  general: '⚙️',
  seo: '🔍',
  contact: '📞',
  social: '📱',
  commerce: '🛒',
  notification: '🔔',
}

// ── Field Component ───────────────────────────────────────────────────────────

function SettingField({
  setting,
  value,
  onChange,
}: {
  setting: Setting
  value: string
  onChange: (key: string, val: string) => void
}) {
  if (!setting.isEditable) {
    return (
      <div>
        <label className="block text-sm font-semibold text-surface-700 mb-1">{setting.label}</label>
        <div className="input bg-surface-50 text-surface-400 cursor-not-allowed">{value || '—'}</div>
        {setting.hint && <p className="text-xs text-surface-400 mt-1">{setting.hint}</p>}
      </div>
    )
  }

  if (setting.type === 'boolean') {
    return (
      <div className="flex items-center justify-between py-1">
        <div>
          <p className="text-sm font-semibold text-surface-800">{setting.label}</p>
          {setting.hint && <p className="text-xs text-surface-400">{setting.hint}</p>}
        </div>
        <button
          type="button"
          onClick={() => onChange(setting.key, value === 'true' ? 'false' : 'true')}
          className={[
            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
            value === 'true' ? 'bg-brand-500' : 'bg-surface-200',
          ].join(' ')}
        >
          <span
            className={[
              'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
              value === 'true' ? 'translate-x-6' : 'translate-x-1',
            ].join(' ')}
          />
        </button>
      </div>
    )
  }

  if (setting.type === 'image') {
    return (
      <div>
        <label className="block text-sm font-semibold text-surface-700 mb-1">
          {setting.label}
          {setting.isRequired && <span className="text-red-500 ms-1">*</span>}
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(setting.key, e.target.value)}
            className="input flex-1"
            placeholder="/images/..."
          />
          {value && (
            <img
              src={value}
              alt={setting.label}
              className="h-10 w-10 rounded-lg object-cover border border-surface-200 flex-shrink-0"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          )}
        </div>
        {setting.hint && <p className="text-xs text-surface-400 mt-1">{setting.hint}</p>}
      </div>
    )
  }

  if (setting.type === 'color') {
    return (
      <div>
        <label className="block text-sm font-semibold text-surface-700 mb-1">{setting.label}</label>
        <div className="flex gap-2 items-center">
          <input
            type="color"
            value={value || '#f59e0b'}
            onChange={(e) => onChange(setting.key, e.target.value)}
            className="h-10 w-16 rounded-lg border border-surface-200 cursor-pointer p-1"
          />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(setting.key, e.target.value)}
            className="input flex-1 font-mono"
            placeholder="#f59e0b"
          />
        </div>
      </div>
    )
  }

  if (setting.key.includes('address') || setting.key.includes('description') || setting.key.includes('text')) {
    return (
      <div>
        <label className="block text-sm font-semibold text-surface-700 mb-1">
          {setting.label}
          {setting.isRequired && <span className="text-red-500 ms-1">*</span>}
        </label>
        <textarea
          value={value}
          onChange={(e) => onChange(setting.key, e.target.value)}
          rows={3}
          className="input w-full resize-none"
        />
        {setting.hint && <p className="text-xs text-surface-400 mt-1">{setting.hint}</p>}
      </div>
    )
  }

  return (
    <div>
      <label className="block text-sm font-semibold text-surface-700 mb-1">
        {setting.label}
        {setting.isRequired && <span className="text-red-500 ms-1">*</span>}
      </label>
      <input
        type={setting.type === 'number' ? 'number' : setting.type === 'url' ? 'url' : 'text'}
        value={value}
        onChange={(e) => onChange(setting.key, e.target.value)}
        className="input w-full"
        dir={setting.type === 'url' ? 'ltr' : undefined}
        placeholder={setting.hint ?? undefined}
      />
      {setting.hint && <p className="text-xs text-surface-400 mt-1">{setting.hint}</p>}
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AdminSettingsPage() {
  const [grouped, setGrouped] = useState<Record<string, Setting[]>>({})
  const [values, setValues] = useState<Record<string, string>>({})
  const [activeGroup, setActiveGroup] = useState('general')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle')
  const [initializing, setInitializing] = useState(false)

  const loadSettings = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/settings')
      const data = await res.json()
      if (data.settings) {
        setGrouped(data.grouped ?? {})
        const vals: Record<string, string> = {}
        for (const s of data.settings as Setting[]) {
          vals[s.key] = s.value ?? ''
        }
        setValues(vals)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadSettings() }, [loadSettings])

  const handleChange = (key: string, val: string) => {
    setValues((prev) => ({ ...prev, [key]: val }))
    setSaveStatus('idle')
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveStatus('idle')
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (res.ok) {
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 3000)
      } else {
        setSaveStatus('error')
      }
    } catch {
      setSaveStatus('error')
    } finally {
      setSaving(false)
    }
  }

  const handleInit = async () => {
    setInitializing(true)
    try {
      await fetch('/api/admin/settings', { method: 'POST' })
      await loadSettings()
    } finally {
      setInitializing(false)
    }
  }

  const groups = Object.keys(grouped)
  const currentSettings = grouped[activeGroup] ?? []

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <header className="bg-white border-b border-surface-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="text-lg font-black text-surface-900">تنظیمات سایت</h1>
          <p className="text-xs text-surface-400 mt-0.5">مدیریت تنظیمات کلی — ذخیره در پایگاه داده</p>
        </div>
        <div className="flex items-center gap-3">
          {groups.length === 0 && !loading && (
            <button
              onClick={handleInit}
              disabled={initializing}
              className="btn btn-outline text-sm py-2 px-4"
            >
              {initializing ? 'در حال راه‌اندازی...' : '⚡ راه‌اندازی اولیه'}
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary py-2 px-5 text-sm"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                در حال ذخیره...
              </span>
            ) : '💾 ذخیره تغییرات'}
          </button>
          {saveStatus === 'saved' && (
            <span className="text-green-600 text-sm font-semibold animate-fade-in flex items-center gap-1">
              <span>✓</span> ذخیره شد
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="text-red-500 text-sm font-semibold">✗ خطا در ذخیره</span>
          )}
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-surface-400 text-sm">در حال بارگذاری...</div>
      ) : groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="text-6xl">⚙️</div>
          <p className="text-surface-500 text-sm">هنوز تنظیماتی ایجاد نشده</p>
          <button onClick={handleInit} disabled={initializing} className="btn btn-primary">
            {initializing ? 'در حال راه‌اندازی...' : 'راه‌اندازی تنظیمات اولیه'}
          </button>
        </div>
      ) : (
        <div className="flex min-h-0">
          {/* Sidebar groups */}
          <nav className="w-52 flex-shrink-0 border-l border-surface-200 bg-white p-3 space-y-1 sticky top-16 self-start max-h-[calc(100vh-4rem)] overflow-y-auto">
            {groups.map((g) => (
              <button
                key={g}
                onClick={() => setActiveGroup(g)}
                className={[
                  'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-start transition-all',
                  activeGroup === g
                    ? 'bg-brand-50 text-brand-700 font-semibold'
                    : 'text-surface-600 hover:bg-surface-50',
                ].join(' ')}
              >
                <span className="text-base">{GROUP_ICONS[g] ?? '⚙️'}</span>
                <span>{GROUP_LABELS[g] ?? g}</span>
                <span className="ms-auto text-xs bg-surface-100 text-surface-500 rounded-full px-1.5 py-0.5">
                  {grouped[g]?.length}
                </span>
              </button>
            ))}
          </nav>

          {/* Content */}
          <div className="flex-1 p-6">
            <div className="max-w-2xl space-y-5">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">{GROUP_ICONS[activeGroup] ?? '⚙️'}</span>
                <div>
                  <h2 className="text-base font-black text-surface-900">
                    {GROUP_LABELS[activeGroup] ?? activeGroup}
                  </h2>
                  <p className="text-xs text-surface-400">{currentSettings.length} فیلد</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-surface-200 p-6 space-y-5">
                {currentSettings.map((s) => (
                  <SettingField
                    key={s.key}
                    setting={s}
                    value={values[s.key] ?? ''}
                    onChange={handleChange}
                  />
                ))}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn btn-primary py-2.5 px-6"
                >
                  {saving ? 'در حال ذخیره...' : '💾 ذخیره تغییرات'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
