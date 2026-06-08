'use client'

import { useState, useEffect, useCallback } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────

interface GatewayConfig {
  id: string
  label: string
  icon: string
  description: string
  fields: {
    key: string
    label: string
    hint?: string
    type: 'text' | 'boolean'
    secret?: boolean
  }[]
}

const GATEWAYS: GatewayConfig[] = [
  {
    id: 'zarinpal',
    label: 'زرین‌پال',
    icon: '💳',
    description: 'درگاه پرداخت اینترنتی زرین‌پال — پرکاربردترین درگاه ایرانی',
    fields: [
      { key: 'zarinpal_enabled',     label: 'فعال‌سازی زرین‌پال',      type: 'boolean' },
      { key: 'zarinpal_merchant_id', label: 'Merchant ID',             type: 'text', hint: 'UUID از پنل زرین‌پال — مثال: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', secret: true },
      { key: 'zarinpal_sandbox',     label: 'حالت آزمایشی (Sandbox)',  type: 'boolean', hint: 'فقط برای تست — در محیط production غیرفعال کنید' },
    ],
  },
  {
    id: 'idpay',
    label: 'آیدی‌پی',
    icon: '🏦',
    description: 'درگاه پرداخت آیدی‌پی — پشتیبانی از همه بانک‌های ایران',
    fields: [
      { key: 'idpay_enabled',  label: 'فعال‌سازی آیدی‌پی',      type: 'boolean' },
      { key: 'idpay_api_key',  label: 'API Key',                 type: 'text', hint: 'از داشبورد idpay.ir دریافت کنید', secret: true },
      { key: 'idpay_sandbox',  label: 'حالت آزمایشی (Sandbox)', type: 'boolean', hint: 'فقط برای تست — در محیط production غیرفعال کنید' },
    ],
  },
]

// ── Toggle ────────────────────────────────────────────────────────────────────

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={[
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
        value ? 'bg-brand-500' : 'bg-surface-200',
      ].join(' ')}
    >
      <span
        className={[
          'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
          value ? 'translate-x-6' : 'translate-x-1',
        ].join(' ')}
      />
    </button>
  )
}

// ── Gateway Card ──────────────────────────────────────────────────────────────

function GatewayCard({
  config,
  values,
  onChange,
  onTest,
  testing,
  testResult,
}: {
  config: GatewayConfig
  values: Record<string, string>
  onChange: (key: string, val: string) => void
  onTest: (id: string) => void
  testing: boolean
  testResult: 'idle' | 'ok' | 'fail'
}) {
  const isEnabled = values[`${config.id}_enabled`] === 'true'
  const [showSecrets, setShowSecrets] = useState(false)

  return (
    <div className={[
      'bg-white rounded-2xl border transition-all duration-200',
      isEnabled ? 'border-brand-200 shadow-sm shadow-brand-100' : 'border-surface-200',
    ].join(' ')}>
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-surface-100">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{config.icon}</span>
          <div>
            <h3 className="font-black text-surface-900 text-sm">{config.label}</h3>
            <p className="text-xs text-surface-400 mt-0.5">{config.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isEnabled && (
            <span className="text-xs bg-green-50 text-green-700 border border-green-200 rounded-full px-2.5 py-1 font-semibold">
              ✓ فعال
            </span>
          )}
          <Toggle
            value={isEnabled}
            onChange={(v) => onChange(`${config.id}_enabled`, v ? 'true' : 'false')}
          />
        </div>
      </div>

      {/* Fields */}
      <div className="p-5 space-y-4">
        {config.fields.filter((f) => f.type !== 'boolean').map((field) => (
          <div key={field.key}>
            <label className="block text-sm font-semibold text-surface-700 mb-1.5">
              {field.label}
            </label>
            <div className="relative">
              <input
                type={field.secret && !showSecrets ? 'password' : 'text'}
                value={values[field.key] ?? ''}
                onChange={(e) => onChange(field.key, e.target.value)}
                className="input w-full font-mono text-sm pe-10"
                dir="ltr"
                placeholder={field.hint}
                autoComplete="off"
              />
              {field.secret && (
                <button
                  type="button"
                  onClick={() => setShowSecrets((s) => !s)}
                  className="absolute inset-y-0 end-2.5 flex items-center text-surface-400 hover:text-surface-600"
                  tabIndex={-1}
                >
                  {showSecrets ? (
                    <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75}><path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75}><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              )}
            </div>
            {field.hint && (
              <p className="text-xs text-surface-400 mt-1">{field.hint}</p>
            )}
          </div>
        ))}

        {/* Sandbox toggles */}
        {config.fields.filter((f) => f.type === 'boolean' && f.key !== `${config.id}_enabled`).map((field) => (
          <div key={field.key} className="flex items-center justify-between py-1 border-t border-surface-50 pt-3">
            <div>
              <p className="text-sm font-semibold text-surface-800">{field.label}</p>
              {field.hint && <p className="text-xs text-surface-400 mt-0.5">{field.hint}</p>}
            </div>
            <Toggle
              value={values[field.key] === 'true'}
              onChange={(v) => onChange(field.key, v ? 'true' : 'false')}
            />
          </div>
        ))}

        {/* Test Connection */}
        {isEnabled && (
          <div className="pt-3 border-t border-surface-100 flex items-center gap-3">
            <button
              type="button"
              onClick={() => onTest(config.id)}
              disabled={testing}
              className="btn btn-outline text-xs py-1.5 px-4"
            >
              {testing ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 border-2 border-brand-500/40 border-t-brand-500 rounded-full animate-spin" />
                  در حال تست...
                </span>
              ) : '🔌 تست اتصال'}
            </button>
            {testResult === 'ok' && (
              <span className="text-xs text-green-600 font-semibold flex items-center gap-1">✓ اتصال برقرار است</span>
            )}
            {testResult === 'fail' && (
              <span className="text-xs text-red-500 font-semibold flex items-center gap-1">✗ خطا در اتصال</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function PaymentGatewaysPage() {
  const [values, setValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle')
  const [testing, setTesting] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<Record<string, 'idle' | 'ok' | 'fail'>>({})

  const loadSettings = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/payment-gateways')
      const data = await res.json() as { values?: Record<string, string> }
      if (data.values) setValues(data.values)
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
      const res = await fetch('/api/admin/payment-gateways', {
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

  const handleTest = async (gatewayId: string) => {
    setTesting(gatewayId)
    setTestResults((prev) => ({ ...prev, [gatewayId]: 'idle' }))
    try {
      const res = await fetch(`/api/admin/payment-gateways/test?gateway=${gatewayId}`)
      setTestResults((prev) => ({ ...prev, [gatewayId]: res.ok ? 'ok' : 'fail' }))
    } catch {
      setTestResults((prev) => ({ ...prev, [gatewayId]: 'fail' }))
    } finally {
      setTesting(null)
    }
  }

  const activeCount = GATEWAYS.filter((g) => values[`${g.id}_enabled`] === 'true').length

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <header className="bg-white border-b border-surface-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="text-lg font-black text-surface-900">درگاه‌های پرداخت</h1>
          <p className="text-xs text-surface-400 mt-0.5">
            مدیریت و تنظیم درگاه‌های پرداخت اینترنتی
            {activeCount > 0 && (
              <span className="ms-2 bg-green-50 text-green-700 border border-green-200 rounded-full px-2 py-0.5 font-semibold">
                {activeCount} درگاه فعال
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
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
            <span className="text-green-600 text-sm font-semibold flex items-center gap-1">✓ ذخیره شد</span>
          )}
          {saveStatus === 'error' && (
            <span className="text-red-500 text-sm font-semibold">✗ خطا در ذخیره</span>
          )}
        </div>
      </header>

      {/* Body */}
      <div className="p-6 max-w-2xl space-y-5">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-surface-400 text-sm">در حال بارگذاری...</div>
        ) : (
          <>
            {/* Info banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-xs text-blue-700 leading-relaxed">
              ⚠️ کلیدهای API به‌صورت رمزنگاری‌شده در پایگاه‌داده ذخیره می‌شوند.
              مطمئن شوید callback URL سایت در پنل درگاه ثبت شده باشد:
              <span className="font-mono ms-1 bg-blue-100 px-1.5 py-0.5 rounded">https://beewaz.ir/api/[gateway]/verify</span>
            </div>

            {GATEWAYS.map((config) => (
              <GatewayCard
                key={config.id}
                config={config}
                values={values}
                onChange={handleChange}
                onTest={handleTest}
                testing={testing === config.id}
                testResult={testResults[config.id] ?? 'idle'}
              />
            ))}

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn btn-primary py-2.5 px-6"
              >
                {saving ? 'در حال ذخیره...' : '💾 ذخیره تغییرات'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
