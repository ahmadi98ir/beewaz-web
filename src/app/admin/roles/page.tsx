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

interface RoleInfo {
  name: string
  labelFa: string
  color: string | null
  isSystem: boolean
  sortOrder: number
}

export default function AdminRolesPage() {
  const [data, setData] = useState<State | null>(null)
  const [rolesList, setRolesList] = useState<RoleInfo[]>([])
  const [selected, setSelected] = useState<Record<string, Set<string>>>({})
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const [activeRole, setActiveRole] = useState('')

  // افزودن/حذف نقش
  const [showNew, setShowNew] = useState(false)
  const [newName, setNewName] = useState('')
  const [newLabel, setNewLabel] = useState('')

  const fetchData = useCallback(async () => {
    const [permRes, rolesRes] = await Promise.all([
      fetch('/api/admin/role-permissions'),
      fetch('/api/admin/roles'),
    ])
    const json = await permRes.json() as State
    const rolesJson = await rolesRes.json() as { roles: RoleInfo[] }
    setData(json)
    // نقش‌های قابل‌مدیریت (به‌جز customer که نقش مشتری است)
    const manageable = (rolesJson.roles ?? []).filter((r) => r.name !== 'customer')
    setRolesList(manageable)
    setActiveRole((prev) => prev || manageable.find((r) => r.name !== 'admin')?.name || manageable[0]?.name || '')
    const sel: Record<string, Set<string>> = {}
    for (const [role, perms] of Object.entries(json.byRole)) {
      sel[role] = new Set(perms)
    }
    setSelected(sel)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  async function createRole() {
    const name = newName.trim()
    const labelFa = newLabel.trim()
    if (!name || !labelFa) return
    const res = await fetch('/api/admin/roles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, labelFa }),
    })
    if (res.ok) {
      setShowNew(false); setNewName(''); setNewLabel('')
      await fetchData()
      setActiveRole(name.toLowerCase().replace(/[^a-z0-9_]/g, ''))
    } else {
      const d = await res.json()
      alert(d.error ?? 'خطا در ایجاد نقش')
    }
  }

  async function deleteRole(name: string) {
    if (!confirm(`آیا از حذف نقش اطمینان دارید؟`)) return
    const res = await fetch(`/api/admin/roles?name=${encodeURIComponent(name)}`, { method: 'DELETE' })
    if (res.ok) { await fetchData(); setActiveRole('') }
    else { const d = await res.json(); alert(d.error ?? 'خطا در حذف نقش') }
  }

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
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-surface-900">مدیریت نقش‌ها و دسترسی‌ها</h1>
            <p className="text-sm text-surface-500 mt-1">تعیین کنید هر نقش به کدام بخش‌ها دسترسی دارد.</p>
          </div>
          <button
            onClick={() => setShowNew(true)}
            className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold bg-brand-600 text-white hover:bg-brand-700 transition-colors"
          >
            + نقش جدید
          </button>
        </div>

        {/* Role tabs */}
        <div className="flex flex-wrap gap-3 mb-6">
          {rolesList.map((r) => (
            <button
              key={r.name}
              onClick={() => setActiveRole(r.name)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                activeRole === r.name
                  ? (r.color ?? 'bg-surface-100 text-surface-700 border-surface-200') + ' shadow-sm'
                  : 'bg-white border-surface-200 text-surface-600 hover:bg-surface-50'
              }`}
            >
              {r.labelFa}
              {r.name === 'admin' && (
                <span className="text-xs opacity-70">(همه دسترسی‌ها)</span>
              )}
              {!r.isSystem && (
                <span
                  onClick={(e) => { e.stopPropagation(); deleteRole(r.name) }}
                  className="text-xs opacity-50 hover:opacity-100 hover:text-red-600 mr-1"
                  title="حذف نقش"
                >✕</span>
              )}
            </button>
          ))}
        </div>

        {/* New role form */}
        {showNew && (
          <div className="mb-6 bg-white rounded-2xl border border-surface-200 p-4 flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs font-semibold text-surface-600 mb-1">نام انگلیسی (یکتا)</label>
              <input value={newName} onChange={(e) => setNewName(e.target.value)} dir="ltr"
                placeholder="accountant" className="input w-full font-mono text-sm" />
            </div>
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs font-semibold text-surface-600 mb-1">عنوان فارسی</label>
              <input value={newLabel} onChange={(e) => setNewLabel(e.target.value)}
                placeholder="حسابدار" className="input w-full text-sm" />
            </div>
            <button onClick={createRole} className="px-4 py-2 rounded-xl text-sm font-bold bg-brand-600 text-white hover:bg-brand-700">ایجاد</button>
            <button onClick={() => setShowNew(false)} className="px-4 py-2 rounded-xl text-sm font-semibold border border-surface-200 text-surface-600">انصراف</button>
          </div>
        )}

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
