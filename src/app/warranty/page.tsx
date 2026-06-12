'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { activateWarranty } from './actions'
import { toFaDigits } from '@/lib/utils'

interface WarrantyRow {
  id: string
  serialNumber: string | null
  productName: string | null
  activatedAt: string
  expiresAt: string
  status: string
}

function fdate(d: string) {
  return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium' }).format(new Date(d))
}

function daysLeft(expiresAt: string) {
  return Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86400000)
}

export default function WarrantyPage() {
  const { status } = useSession()
  const [serial, setSerial] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ ok: true; productName: string; expiresAt: string } | { ok: false; error: string } | null>(null)
  const [warranties, setWarranties] = useState<WarrantyRow[]>([])
  const [warrantyLoading, setWarrantyLoading] = useState(true)

  const fetchWarranties = useCallback(async () => {
    setWarrantyLoading(true)
    try {
      const res = await fetch('/api/user/warranties')
      if (res.ok) {
        const j = await res.json() as { warranties: WarrantyRow[] }
        setWarranties(j.warranties ?? [])
      }
    } finally { setWarrantyLoading(false) }
  }, [])

  useEffect(() => {
    if (status === 'authenticated') void fetchWarranties()
  }, [status, fetchWarranties])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!serial.trim()) return
    setLoading(true)
    setResult(null)
    const res = await activateWarranty(serial.trim())
    setResult(res)
    setLoading(false)
    if (res.ok) {
      setSerial('')
      void fetchWarranties()
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-surface-50 flex flex-col items-center justify-center gap-4" dir="rtl">
        <span className="text-5xl">🔒</span>
        <p className="font-bold text-surface-700">برای ثبت گارانتی ابتدا وارد شوید</p>
        <Link href="/login" className="btn btn-primary px-8">ورود به حساب</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-50 py-8" dir="rtl">
      <div className="max-w-2xl mx-auto px-4 space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/profile" className="p-2 rounded-xl hover:bg-surface-100 text-surface-400 transition-colors">
            <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-black text-surface-900">ثبت و مدیریت گارانتی</h1>
            <p className="text-xs text-surface-400 mt-0.5">شماره سریال محصول خود را وارد کنید تا گارانتی فعال شود</p>
          </div>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-2xl border border-surface-200 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-xl">🔑</div>
            <div>
              <h2 className="font-bold text-surface-900">فعال‌سازی گارانتی</h2>
              <p className="text-xs text-surface-500">شماره سریال روی برچسب محصول یا جعبه درج شده است</p>
            </div>
          </div>

          <form onSubmit={e => { void handleSubmit(e) }} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-2">شماره سریال محصول</label>
              <input
                type="text"
                value={serial}
                onChange={e => setSerial(e.target.value.toUpperCase())}
                placeholder="مثال: BW-2024-XXXXX"
                className="w-full px-4 py-3 border border-surface-200 rounded-xl text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-brand-300 bg-surface-50 uppercase"
                dir="ltr"
                maxLength={50}
              />
            </div>

            {result && (
              <div className={`rounded-xl p-4 text-sm font-semibold flex items-start gap-3 ${
                result.ok
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                <span className="text-lg flex-shrink-0">{result.ok ? '✅' : '❌'}</span>
                <div>
                  {result.ok ? (
                    <>
                      <p>گارانتی <strong>{result.productName}</strong> با موفقیت فعال شد!</p>
                      <p className="font-normal mt-1 text-green-700">تاریخ انقضا: {fdate(result.expiresAt)}</p>
                    </>
                  ) : (
                    <p>{result.error}</p>
                  )}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !serial.trim()}
              className="w-full btn btn-primary py-3 text-sm font-bold disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  در حال بررسی...
                </span>
              ) : 'فعال‌سازی گارانتی'}
            </button>
          </form>
        </div>

        {/* Warranties List */}
        <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-100">
            <h2 className="font-bold text-surface-900">گارانتی‌های من</h2>
          </div>

          {warrantyLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : warranties.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-surface-400">
              <span className="text-4xl">🛡️</span>
              <p className="text-sm">هنوز گارانتی‌ای ثبت نشده است</p>
            </div>
          ) : (
            <div className="divide-y divide-surface-50">
              {warranties.map(w => {
                const left = daysLeft(w.expiresAt)
                const expired = left <= 0
                const urgent = left > 0 && left <= 30
                return (
                  <div key={w.id} className="px-6 py-4 flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
                      expired ? 'bg-red-50' : urgent ? 'bg-amber-50' : 'bg-green-50'
                    }`}>
                      🛡️
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-surface-900 text-sm">{w.productName ?? 'محصول'}</p>
                      <p className="text-xs text-surface-400 font-mono mt-0.5" dir="ltr">{w.serialNumber}</p>
                      <p className="text-xs text-surface-500 mt-1">
                        فعال‌سازی: {fdate(w.activatedAt)} — انقضا: {fdate(w.expiresAt)}
                      </p>
                    </div>
                    <div className="text-end flex-shrink-0">
                      {expired ? (
                        <span className="px-2.5 py-1 rounded-lg bg-red-50 text-red-600 border border-red-200 text-xs font-bold">منقضی</span>
                      ) : (
                        <span className={`px-2.5 py-1 rounded-lg border text-xs font-bold ${urgent ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                          {toFaDigits(left)} روز مانده
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Link to public checker */}
        <div className="bg-surface-100 rounded-2xl p-4 flex items-center gap-3 text-sm">
          <span className="text-xl flex-shrink-0">🔍</span>
          <div className="flex-1">
            <p className="font-semibold text-surface-700">استعلام اصالت کالا</p>
            <p className="text-surface-500 text-xs mt-0.5">بررسی اصالت کالا بدون نیاز به ورود</p>
          </div>
          <Link href="/fa/warranty-check" className="btn btn-outline text-xs py-2 px-3 flex-shrink-0">استعلام</Link>
        </div>

      </div>
    </div>
  )
}
