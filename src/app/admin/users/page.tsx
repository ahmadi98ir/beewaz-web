'use client'

import { useState, useEffect } from 'react'
import { SearchIcon } from '@/components/ui/icons'

interface User {
  id: string
  fullName: string
  phone: string
  role: string
  createdAt: string
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch('/api/admin/users')
        if (!res.ok) throw new Error('Failed to fetch users')
        const data = await res.json()
        setUsers(data.users || [])
      } catch (err) {
        console.error('Error fetching users:', err)
        setError('خطا در بارگیری کاربران')
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  const filtered = users.filter((u) => {
    const matchSearch = !search || u.fullName.includes(search) || u.phone.includes(search)
    return matchSearch
  })

  const roleLabel: Record<string, string> = {
    admin: 'مدیر',
    customer: 'مشتری',
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <header className="bg-white border-b border-surface-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black text-surface-900">مدیریت کاربران</h1>
          <p className="text-xs text-surface-400 mt-0.5">{users.length} کاربر ثبت شده</p>
        </div>
      </header>

      <div className="p-6">
        <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
          {/* Search */}
          <div className="flex items-center justify-between gap-4 p-4 border-b border-surface-100 flex-wrap">
            <div className="relative">
              <SearchIcon size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-surface-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="جستجوی نام یا شماره موبایل..."
                className="ps-9 pe-4 py-2 text-sm border border-surface-200 rounded-xl w-52 focus:outline-none focus:border-brand-600 transition-colors"
              />
            </div>
            <div className="text-xs text-surface-500">
              {filtered.length} کاربر
            </div>
          </div>

          {/* Table */}
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
                      {['کاربر', 'شماره موبایل', 'سطح دسترسی', 'تاریخ ثبت', ''].map((h) => (
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
                              {user.fullName[0] || 'ن'}
                            </div>
                            <span className="font-semibold text-surface-900">{user.fullName}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 font-mono text-xs text-surface-500" dir="ltr">{user.phone}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold border ${user.role === 'admin' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                            {roleLabel[user.role] || user.role}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-surface-500 text-xs">
                          {new Intl.DateTimeFormat('fa-IR', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(user.createdAt))}
                        </td>
                        <td className="px-5 py-4">
                          <button className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-brand-50">
                            ویرایش
                          </button>
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
    </div>
  )
}
