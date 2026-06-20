'use client'

import { useState, useEffect, useCallback } from 'react'

interface AnalyticsValues {
  ga4_enabled: string
  ga4_measurement_id: string
  google_site_verification: string
  gtm_container_id: string
}

const EMPTY: AnalyticsValues = {
  ga4_enabled: 'false',
  ga4_measurement_id: '',
  google_site_verification: '',
  gtm_container_id: '',
}

const GA4_ID_RE = /^G-[A-Z0-9]+$/
const GTM_ID_RE = /^GTM-[A-Z0-9]+$/

export default function GoogleAnalyticsIntegrationPage() {
  const [values, setValues] = useState<AnalyticsValues>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      let res = await fetch('/api/admin/settings')
      let data = await res.json() as { grouped?: Record<string, { key: string; value: string | null }[]> }

      // اگر هنوز تنظیمات اولیه ساخته نشده، یک‌بار راه‌اندازی کن
      if (!data.grouped || !data.grouped.analytics) {
        await fetch('/api/admin/settings', { method: 'POST' })
        res = await fetch('/api/admin/settings')
        data = await res.json()
      }

      const rows = data.grouped?.analytics ?? []
      const next = { ...EMPTY }
      for (const r of rows) {
        if (r.key in next) next[r.key as keyof AnalyticsValues] = r.value ?? ''
      }
      setValues(next)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const set = (key: keyof AnalyticsValues, val: string) => {
    setValues((p) => ({ ...p, [key]: val }))
    setSaveStatus('idle')
  }

  const idValid = values.ga4_measurement_id === '' || GA4_ID_RE.test(values.ga4_measurement_id)
  const gtmValid = values.gtm_container_id === '' || GTM_ID_RE.test(values.gtm_container_id)

  const save = async () => {
    setSaving(true)
    setSaveStatus('idle')
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      setSaveStatus(res.ok ? 'saved' : 'error')
      if (res.ok) setTimeout(() => setSaveStatus('idle'), 3000)
    } catch {
      setSaveStatus('error')
    } finally {
      setSaving(false)
    }
  }

  const connected = values.ga4_enabled === 'true' && GA4_ID_RE.test(values.ga4_measurement_id)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-surface-400 text-sm">در حال بارگذاری...</div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <header className="bg-white border-b border-surface-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="text-lg font-black text-surface-900">اتصال گوگل آنالیتکس</h1>
          <p className="text-xs text-surface-400 mt-0.5">ردیابی بازدید و رفتار کاربران با Google Analytics 4</p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={[
              'text-xs font-bold px-3 py-1.5 rounded-full',
              connected ? 'bg-green-50 text-green-600' : 'bg-surface-100 text-surface-400',
            ].join(' ')}
          >
            {connected ? '✅ متصل' : '⏸️ غیرفعال'}
          </span>
          <button onClick={() => void save()} disabled={saving} className="btn btn-primary py-2 px-5 text-sm">
            {saving ? 'در حال ذخیره...' : '💾 ذخیره تغییرات'}
          </button>
          {saveStatus === 'saved' && (
            <span className="text-green-600 text-sm font-semibold">✓ ذخیره شد</span>
          )}
          {saveStatus === 'error' && (
            <span className="text-red-500 text-sm font-semibold">✗ خطا در ذخیره</span>
          )}
        </div>
      </header>

      <div className="p-6 max-w-2xl space-y-6">
        {/* GA4 main card */}
        <div className="bg-white rounded-2xl border border-surface-200 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-surface-800">فعال‌سازی Google Analytics 4</p>
              <p className="text-xs text-surface-400">با فعال شدن، کد ردیابی روی همه صفحات سایت (به‌جز پنل ادمین) بارگذاری می‌شود</p>
            </div>
            <button
              type="button"
              onClick={() => set('ga4_enabled', values.ga4_enabled === 'true' ? 'false' : 'true')}
              className={[
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0',
                values.ga4_enabled === 'true' ? 'bg-brand-500' : 'bg-surface-200',
              ].join(' ')}
            >
              <span
                className={[
                  'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
                  values.ga4_enabled === 'true' ? 'translate-x-6' : 'translate-x-1',
                ].join(' ')}
              />
            </button>
          </div>

          <div>
            <label className="block text-sm font-semibold text-surface-700 mb-1">Measurement ID</label>
            <input
              type="text"
              value={values.ga4_measurement_id}
              onChange={(e) => set('ga4_measurement_id', e.target.value.trim())}
              placeholder="G-XXXXXXXXXX"
              dir="ltr"
              className={`input w-full font-mono ${!idValid ? 'border-red-300 focus:ring-red-300' : ''}`}
            />
            {!idValid && (
              <p className="text-xs text-red-500 mt-1">فرمت صحیح نیست — باید با G- شروع شود</p>
            )}
            <p className="text-xs text-surface-400 mt-1">
              از پنل Google Analytics → Admin → Data Streams → Web stream بردارید
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-surface-700 mb-1">
              Google Tag Manager ID <span className="text-surface-400 font-normal">(اختیاری)</span>
            </label>
            <input
              type="text"
              value={values.gtm_container_id}
              onChange={(e) => set('gtm_container_id', e.target.value.trim())}
              placeholder="GTM-XXXXXXX"
              dir="ltr"
              className={`input w-full font-mono ${!gtmValid ? 'border-red-300 focus:ring-red-300' : ''}`}
            />
            {!gtmValid && (
              <p className="text-xs text-red-500 mt-1">فرمت صحیح نیست — باید با GTM- شروع شود</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-surface-700 mb-1">
              کد تأیید Google Search Console <span className="text-surface-400 font-normal">(اختیاری)</span>
            </label>
            <input
              type="text"
              value={values.google_site_verification}
              onChange={(e) => set('google_site_verification', e.target.value.trim())}
              placeholder="مثال: AbCdEfGhIjKlMnOpQrStUv..."
              dir="ltr"
              className="input w-full font-mono"
            />
            <p className="text-xs text-surface-400 mt-1">
              برای تأیید مالکیت دامنه در Google Search Console — مقدار محتوای متاتگ را اینجا وارد کنید (نه کد کامل HTML)
            </p>
          </div>
        </div>

        {/* راهنما */}
        <div className="bg-brand-50 rounded-2xl border border-brand-100 p-5 space-y-2">
          <p className="text-sm font-bold text-brand-800">راهنمای اتصال</p>
          <ol className="text-xs text-brand-700 space-y-1.5 list-decimal list-inside leading-relaxed">
            <li>وارد <span dir="ltr" className="font-mono">analytics.google.com</span> شوید و یک «Property» جدید برای سایت بسازید</li>
            <li>از بخش Admin → Data Streams یک Web Stream با آدرس سایت ایجاد کنید</li>
            <li>Measurement ID (شروع‌شده با G-) را کپی کرده و در فیلد بالا وارد کنید</li>
            <li>گزینه «فعال‌سازی» را روشن کرده و ذخیره کنید — تا چند دقیقه بعد در گزارش Realtime آنالیتکس بازدید را خواهید دید</li>
            <li>برای ثبت سایت در Search Console نیز می‌توانید کد تأیید مالکیت را در فیلد مربوطه وارد کنید</li>
          </ol>
        </div>

        {connected && (
          <div className="bg-surface-50 rounded-2xl border border-surface-200 p-5">
            <p className="text-xs font-bold text-surface-600 mb-2">پیش‌نمایش کد تزریق‌شده در سایت</p>
            <pre dir="ltr" className="text-[11px] text-surface-500 bg-white rounded-xl p-3 overflow-x-auto font-mono">
{`<script async src="https://www.googletagmanager.com/gtag/js?id=${values.ga4_measurement_id}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${values.ga4_measurement_id}');
</script>`}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
