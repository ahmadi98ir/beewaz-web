'use client'

import { useEffect, useState, useCallback } from 'react'

interface Permission {
  key: string
  label: string
  groupName: string
  sortOrder: number
}

interface State {
  grouped: Record<string, Permission[]>
  byRole: Record<string, string[]>
}

const ROLES = [
  { key: 'admin',       label: 'مدیر کل',     color: 'bg-red-100 text-red-700 border-red-200' },
  { key: 'sales_agent', label: 'کارشناس فروش', color: 'bg-blue-100 text-blue-700 border-blue-200' },
]

export default function AdminRolesPage() {
  const [data, setData] = useState<State | null>(null)
  const [selected, setSelected] = useState<Record<string, Set<string>>>({})
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const [activeRole, setActiveRole] = useState('sales_agent')

  const fetchData = useCallback(async () => {
    const res = await fetch('/api/admin/role-permissions')
    const json = await res.json() as State
    setData(json)
    const sel: Record<string, Set<string>> = {}
    for (const [role, perms] of Object.entries(json.byRole)) {
      sel[role] = new Set(perms)
    }
    setSelected(sel)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  function toggle(role: string, perm: string) {
    if (role === 'admin') return // admin always has all
    setSelected((prev) => {
      const next = { ...prev }
      const set = new Set(next[role] ?? [])
      if (set.has(perm)) set.delete(perm)
      else set.add(perm)
      next[role] = set
      return next
    })
  }

  function toggleAll(role: string, keys: string[]) {
    if (role === 'admin') return
    setSelected((prev) => {
      const next = { ...prev }
      const set = new Set(next[role] ?? [])
      const allChecked = keys.every((k) => set.has(k))
      if (allChecked) keys.forEach((k) => set.delete(k))
      else keys.forEach((k) => set.add(k))
      next[role] = set
      return next
    })
  }

  async function save(role: string) {
    if (role === 'admin') return
    setSaving(role)
    try {
      await fetch('/api/admin/role-permissions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, permissions: [...(selected[role] ?? [])] }),
      })
      setSaved(role)
      setTimeout(() => setSaved(null), 2000)
    } finally {
      setSaving(null)
    }
  }

  if (!data) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-surface-400">در حال بارگذاری...</p>
      </div>
    )
  }

  const groups = Object.entries(data.grouped)

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-surface-900">مدیریت نقش‌ها و دسترسی‌ها</h1>
          <p className="text-sm text-surface-500 mt-1">تعیین کنید هر نقش به کدام بخش‌ها دسترسی دارد.</p>
        </div>

        {/* Role tabs */}
        <div className="flex gap-3 mb-6">
          {ROLES.map((r) => (
            <button
              key={r.key}
              onClick={() => setActiveRole(r.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                activeRole === r.key
                  ? r.color + ' shadow-sm'
                  : 'bg-white border-surface-200 text-surface-600 hover:bg-surface-50'
              }`}
            >
              {r.label}
              {r.key === 'admin' && (
                <span className="text-xs opacity-70">(همه دسترسی‌ها)</span>
              )}
            </button>
          ))}
        </div>

        {/* Permission matrix */}
        <div className="space-y-4">
          {groups.map(([group, perms]) => {
            const groupKeys = perms.map((p) => p.key)
            const roleSet = selected[activeRole] ?? new Set<string>()
            const isAdmin = activeRole === 'admin'
            const allChecked = isAdmin || groupKeys.every((k) => roleSet.has(k))
            const someChecked = !allChecked && groupKeys.some((k) => roleSet.has(k))

            return (
              <div key={group} className="bg-white rounded-2xl border border-surface-100 overflow-hidden">
                {/* Group header */}
                <div className="flex items-center justify-between px-5 py-3 bg-surface-50 border-b border-surface-100">
                  <button
                    onClick={() => toggleAll(activeRole, groupKeys)}
                    disabled={isAdmin}
                    className="flex items-center gap-2.5 group"
                  >
                    <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                      allChecked
                        ? 'bg-brand-600 border-brand-600'
                        : someChecked
                        ? 'bg-brand-100 border-brand-400'
                        : 'border-surface-300 bg-white group-hover:border-brand-400'
                    }`}>
                      {allChecked && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                      {someChecked && <span className="w-2 h-0.5 bg-brand-600 rounded" />}
                    </span>
                    <span className="font-bold text-surface-700 text-sm">{group}</span>
                  </button>
                  <span className="text-xs text-surface-400">{perms.length} مورد</span>
                </div>

                {/* Permissions */}
                <div className="divide-y divide-surface-50">
                  {perms.map((p) => {
                    const checked = isAdmin || roleSet.has(p.key)
                    return (
                      <label
                        key={p.key}
                        className={`flex items-center gap-3 px-5 py-3 cursor-pointer transition-colors ${
                          isAdmin ? 'opacity-60' : 'hover:bg-surface-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={isAdmin}
                          onChange={() => toggle(activeRole, p.key)}
                          className="sr-only"
                        />
                        <span className={`w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                          checked
                            ? 'bg-brand-600 border-brand-600'
                            : 'border-surface-300 bg-white'
                        }`}>
                          {checked && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </span>
                        <div className="flex-1">
                          <span className="text-sm text-surface-700">{p.label}</span>
                          <span className="text-xs text-surface-400 mr-2 font-mono">{p.key}</span>
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Save button */}
        {activeRole !== 'admin' && (
          <div className="sticky bottom-6 mt-6 flex justify-end">
            <button
              onClick={() => save(activeRole)}
              disabled={saving === activeRole}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm shadow-lg transition-all ${
                saved === activeRole
                  ? 'bg-green-600 text-white'
                  : 'bg-brand-600 text-white hover:bg-brand-700'
              } disabled:opacity-60`}
            >
              {saving === activeRole
                ? 'در حال ذخیره...'
                : saved === activeRole
                ? '✓ ذخیره شد'
                : 'ذخیره تغییرات'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
