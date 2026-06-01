'use client'

import { useState, useEffect } from 'react'
import { SearchIcon } from '@/components/ui/icons'

interface User {
  id: string
  fullName: string | null
  phone: string
  email?: string | null
  role: string
  isVerified?: boolean
  createdAt: string
}

interface RoleInfo {
  name: string
  labelFa: string
  color: string | null
}

// ── Modal ─────────────────────────────────────────────────────────────────────

interface ModalProps {
  user: Partial<User> | null
  roles: RoleInfo[]
  onClose: () => void
  onSaved: () => void
}

function UserModal({ user, roles, onClose, onSaved }: ModalProps) {
  const isNew = !user?.id
  const [form, setForm] = useState({
    fullName: user?.fullName ?? '',
    phone: user?.phone ?? '',
    email: user?.email ?? '',
    role: user?.role ?? 'customer',
    password: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const body = isNew
        ? form
        : { id: user!.id, ...form }
      const res = await fetch('/api/admin/users', {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'خطا'); return }
      onSaved()
    } catch {
      setError('خطا در ارتباط با سرور')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100">
          <h2 className="font-black text-surface-900">{isNew ? 'کاربر جدید' : 'ویرایش کاربر'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-400 text-lg leading-none">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-surface-700 mb-1">نام کامل</label>
            <input value={form.fullName} onChange={(e) => set('fullName', e.target.value)} className="input w-full" placeholder="نام و نام خانوادگی" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-surface-700 mb-1">شماره موبایل <span className="text-red-500">*</span></label>
            <input value={form.phone} onChange={(e) => set('phone', e.target.value)} className="input w-full font-mono" placeholder="09xxxxxxxxx" dir="ltr" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-surface-700 mb-1">ایمیل</label>
            <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className="input w-full" placeholder="example@email.com" dir="ltr" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-surface-700 mb-1">سطح دسترسی</label>
            <select value={form.role} onChange={(e) => set('role', e.target.value)} className="input w-full">
              {roles.map((r) => <option key={r.name} value={r.name}>{r.labelFa}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-surface-700 mb-1">{isNew ? 'رمز عبور' : 'رمز عبور جدید (اختیاری)'}</label>
            <input type="password" value={form.password} onChange={(e) => set('password', e.target.value)} className="input w-full" placeholder={isNew ? 'رمز عبور' : 'خالی بگذارید تا تغییر نکند'} dir="ltr" />
          </div>
          {error && <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn btn-outline py-2 px-4 text-sm">انصراف</button>
            <button type="submit" disabled={saving} className="btn btn-primary py-2 px-5 text-sm">
              {saving ? 'در حال ذخیره...' : isNew ? 'ایجاد کاربر' : 'ذخیره تغییرات'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AdminUsersPage() {
  const [search, setSearch] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<RoleInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modal, setModal] = useState<Partial<User> | null | false>(false)

  const roleLabel: Record<string, string> = Object.fromEntries(roles.map((r) => [r.name, r.labelFa]))
  const roleStyle: Record<string, string> = Object.fromEntries(
    roles.map((r) => [r.name, (r.color ?? 'bg-surface-50 text-surface-700 border-surface-200').replace(/bg-(\w+)-100/, 'bg-$1-50')])
  )

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const [usersRes, rolesRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/roles'),
      ])
      if (!usersRes.ok) throw new Error()
      const data = await usersRes.json()
      const rolesData = rolesRes.ok ? await rolesRes.json() : { roles: [] }
      setUsers(data.users || [])
      setRoles(rolesData.roles || [])
      setError(null)
    } catch {
      setError('خطا در بارگیری کاربران')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  const handleDelete = async (user: User) => {
    if (!confirm(`آیا از حذف کاربر "${user.fullName || user.phone}" اطمینان دارید؟`)) return
    await fetch(`/api/admin/users?id=${user.id}`, { method: 'DELETE' })
    fetchUsers()
  }

  const filtered = users.filter((u) =>
    !search || (u.fullName ?? '').includes(search) || u.phone.includes(search) || (u.email ?? '').includes(search)
  )

  return (
    <div className="flex-1 overflow-y-auto">
      <header className="bg-white border-b border-surface-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black text-surface-900">مدیریت کاربران</h1>
          <p className="text-xs text-surface-400 mt-0.5">{users.length} کاربر ثبت شده</p>
        </div>
        <button onClick={() => setModal({})} className="btn btn-primary text-sm py-2 px-4">
          + کاربر جدید
        </button>
      </header>

      <div className="p-6">
        <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
          <div className="flex items-center justify-between gap-4 p-4 border-b border-surface-100 flex-wrap">
            <div className="relative">
              <SearchIcon size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-surface-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="جستجوی نام، موبایل یا ایمیل..."
                className="ps-9 pe-4 py-2 text-sm border border-surface-200 rounded-xl w-60 focus:outline-none focus:border-brand-600 transition-colors"
              />
            </div>
            <div className="text-xs text-surface-500">{filtered.length} کاربر</div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-surface-400">درحال بارگیری...</div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">{error}</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-surface-50 text-surface-500 text-xs">
                    <tr>
                      {['کاربر', 'شماره موبایل', 'ایمیل', 'سطح دسترسی', 'تاریخ ثبت', 'عملیات'].map((h) => (
                        <th key={h} className="text-start px-5 py-3 font-semibold whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-100">
                    {filtered.map((user) => (
                      <tr key={user.id} className="hover:bg-surface-50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0">
                              {(user.fullName?.[0]) || user.phone[1] || 'ن'}
                            </div>
                            <span className="font-semibold text-surface-900">{user.fullName || '—'}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 font-mono text-xs text-surface-500" dir="ltr">{user.phone}</td>
                        <td className="px-5 py-4 text-xs text-surface-500">{user.email || '—'}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold border ${roleStyle[user.role] ?? 'bg-surface-50 text-surface-700 border-surface-200'}`}>
                            {roleLabel[user.role] || user.role}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-surface-500 text-xs">
                          {new Intl.DateTimeFormat('fa-IR', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(user.createdAt))}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setModal(user)}
                              className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-brand-50"
                            >
                              ویرایش
                            </button>
                            <button
                              onClick={() => handleDelete(user)}
                              className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
                            >
                              حذف
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filtered.length === 0 && (
                  <div className="text-center py-12 text-surface-400 text-sm">کاربری یافت نشد.</div>
                )}
              </div>
              <div className="px-5 py-3 border-t border-surface-100 bg-surface-50 text-sm text-surface-500">
                {filtered.length} از {users.length} کاربر
              </div>
            </>
          )}
        </div>
      </div>

      {modal !== false && (
        <UserModal
          user={modal}
          roles={roles}
          onClose={() => setModal(false)}
          onSaved={() => { setModal(false); fetchUsers() }}
        />
      )}
    </div>
  )
}
