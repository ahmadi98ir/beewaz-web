'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toFaDigits } from '@/lib/utils'

interface CheckResult {
  found: boolean
  genuine?: boolean
  registered?: boolean
  productName?: string | null
  warrantyStatus?: string
  activatedAt?: string
  expiresAt?: string
  isExpired?: boolean
  message?: string
}

function fdate(d: string) {
  return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'long' }).format(new Date(d))
}

function daysLeft(expiresAt: string) {
  return Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86400000)
}

export default function WarrantyCheckPage({ params }: { params: Promise<{ lang: string }> }) {
  void params
  const [serial, setSerial] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CheckResult | null>(null)
  const [error, setError] = useState('')

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!serial.trim()) return
    setLoading(true)
    setResult(null)
    setError('')
    try {
      const res = await fetch(`/api/warranty/check?serial=${encodeURIComponent(serial.trim())}`)
      const j = await res.json() as CheckResult
      setResult(j)
    } catch {
      setError('خطا در برقراری ارتباط با سرور')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-surface-50" dir="rtl">

      {/* Hero */}
      <div className="bg-gradient-to-l from-brand-700 to-brand-900 text-white py-14 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-6xl mb-4">🛡️</div>
          <h1 className="text-2xl font-black mb-2">استعلام اصالت کالا و وضعیت گارانتی</h1>
          <p className="text-brand-200 text-sm leading-relaxed">
            با وارد کردن شماره سریال دستگاه، از اصالت کالا و وضعیت گارانتی آن مطمئن شوید
          </p>
        </div>
      </div>

      {/* Search Form */}
      <div className="max-w-2xl mx-auto px-4 -mt-6">
        <div className="bg-white rounded-2xl shadow-xl border border-surface-100 p-6">
          <form onSubmit={e => { void handleCheck(e) }} className="flex gap-3">
            <input
              type="text"
              value={serial}
              onChange={e => setSerial(e.target.value.toUpperCase())}
              placeholder="شماره سریال را وارد کنید..."
              className="flex-1 px-4 py-3 border border-surface-200 rounded-xl text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-brand-300 bg-surface-50 uppercase"
              dir="ltr"
              maxLength={50}
            />
            <button
              type="submit"
              disabled={loading || !serial.trim()}
              className="btn btn-primary px-6 py-3 text-sm font-bold flex-shrink-0 disabled:opacity-50"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin block" />
              ) : 'استعلام'}
            </button>
          </form>

          {error && (
            <p className="mt-3 text-sm text-red-600 font-semibold">{error}</p>
          )}
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="max-w-2xl mx-auto px-4 mt-6">
          {!result.found ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
              <div className="text-4xl mb-3">❌</div>
              <h2 className="font-bold text-red-800 text-lg mb-2">شماره سریال یافت نشد</h2>
              <p className="text-red-600 text-sm">این شماره سریال در سامانه ثبت نشده است. احتمال دارد کالای شما اصل نباشد.</p>
              <div className="mt-4 p-3 bg-red-100 rounded-xl text-xs text-red-700">
                در صورت تردید، با پشتیبانی تماس بگیرید.
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Genuine badge */}
              <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-green-600 flex items-center justify-center text-white text-2xl flex-shrink-0">✓</div>
                <div>
                  <h2 className="font-black text-green-800 text-lg">کالای اصل و معتبر</h2>
                  <p className="text-green-700 text-sm mt-0.5">این محصول در سامانه بیواز ثبت و تأیید شده است</p>
                </div>
              </div>

              {/* Product & warranty info */}
              <div className="bg-white border border-surface-200 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-surface-100 bg-surface-50">
                  <h3 className="font-bold text-surface-900 text-sm">اطلاعات محصول</h3>
                </div>
                <div className="p-5 space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-surface-500">نام محصول</span>
                    <span className="font-semibold text-surface-900">{result.productName ?? '—'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-surface-500">شماره سریال</span>
                    <span className="font-mono text-surface-700 text-xs" dir="ltr">{serial}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-surface-500">وضعیت ثبت گارانتی</span>
                    {result.registered ? (
                      <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">ثبت شده</span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold">ثبت نشده</span>
                    )}
                  </div>

                  {result.registered && result.expiresAt && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-surface-500">تاریخ فعال‌سازی</span>
                        <span className="font-semibold text-surface-700">{result.activatedAt ? fdate(result.activatedAt) : '—'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-surface-500">تاریخ اتمام گارانتی</span>
                        <span className="font-semibold text-surface-700">{fdate(result.expiresAt)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-surface-500">وضعیت گارانتی</span>
                        {result.isExpired ? (
                          <span className="px-2.5 py-1 rounded-lg bg-red-50 text-red-600 border border-red-200 text-xs font-bold">منقضی شده</span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg bg-green-50 text-green-700 border border-green-200 text-xs font-bold">
                            فعال — {toFaDigits(daysLeft(result.expiresAt))} روز مانده
                          </span>
                        )}
                      </div>
                    </>
                  )}

                  {!result.registered && (
                    <div className="mt-2 p-3 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-700">
                      این محصول هنوز گارانتی ثبت نشده دارد. اگر خریدار هستید،{' '}
                      <Link href="/warranty" className="font-bold underline">گارانتی خود را ثبت کنید</Link>.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer note */}
      <div className="max-w-2xl mx-auto px-4 mt-8 mb-12 text-center text-xs text-surface-400 space-y-1">
        <p>اطلاعات شخصی خریدار به دلایل حریم خصوصی نمایش داده نمی‌شود.</p>
        <p>
          <Link href="/fa" className="text-brand-600 hover:underline">بازگشت به صفحه اصلی</Link>
          {' · '}
          <Link href="/warranty" className="text-brand-600 hover:underline">ثبت گارانتی</Link>
        </p>
      </div>
    </div>
  )
}
