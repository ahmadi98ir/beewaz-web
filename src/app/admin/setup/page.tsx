'use client'

import { useState } from 'react'
import { migrateDefaultVariants } from '@/app/admin/actions/migrate-variants'
import { seedAnalyticsSnapshots } from '@/app/admin/actions/seed-analytics'
import { fixWarrantySchema } from '@/app/admin/actions/fix-warranty-schema'

type Result = { ok: boolean; message: string; detail?: string }

function ActionCard({
  title, description, warning, buttonLabel, onRun,
}: {
  title: string; description: string; warning?: string; buttonLabel: string
  onRun: () => Promise<Result>
}) {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [result, setResult] = useState<Result | null>(null)

  async function handle() {
    setState('loading')
    try {
      const r = await onRun()
      setResult(r)
      setState(r.ok ? 'done' : 'error')
    } catch (e) {
      setResult({ ok: false, message: e instanceof Error ? e.message : 'خطای ناشناخته' })
      setState('error')
    }
  }

  return (
    <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6 space-y-4">
      <div>
        <h2 className="text-white font-bold text-base">{title}</h2>
        <p className="text-white/50 text-sm mt-1">{description}</p>
        {warning && (
          <p className="text-amber-400/80 text-xs mt-2 bg-amber-400/10 border border-amber-400/20 rounded-lg px-3 py-2">
            ⚠️ {warning}
          </p>
        )}
      </div>
      <button
        onClick={handle}
        disabled={state === 'loading' || state === 'done'}
        className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
          state === 'done'
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            : 'bg-indigo-600 hover:bg-indigo-500 text-white'
        }`}
      >
        {state === 'loading' ? '⏳ در حال اجرا...' : state === 'done' ? '✅ انجام شد' : buttonLabel}
      </button>
      {result && (
        <div className={`text-xs rounded-lg px-3 py-2 font-mono whitespace-pre-wrap ${
          result.ok ? 'bg-emerald-500/10 text-emerald-300' : 'bg-red-500/10 text-red-300'
        }`}>
          {result.message}
          {result.detail && <div className="mt-1 text-white/40">{result.detail}</div>}
        </div>
      )}
    </div>
  )
}

export default function SetupPage() {
  return (
    <div className="p-8 max-w-2xl space-y-6">
      <div>
        <h1 className="text-white text-2xl font-bold">ابزارهای راه‌اندازی</h1>
        <p className="text-white/40 text-sm mt-1">
          این اقدامات ایمن و idempotent هستند — اجرای مکرر مشکلی ایجاد نمی‌کند.
        </p>
      </div>

      <ActionCard
        title="Variant پیش‌فرض برای محصولات قدیمی"
        description="برای هر محصول فعال که هنوز Variant ندارد، یک Variant پیش‌فرض با همان قیمت و موجودی می‌سازد. محصولات و سفارشات موجود بدون تغییر باقی می‌مانند."
        buttonLabel="اجرای Migration Variants"
        onRun={async () => {
          const r = await migrateDefaultVariants()
          return {
            ok: r.errors.length === 0,
            message: `بررسی شده: ${r.checked} محصول\nVariant جدید ساخته شد: ${r.created}\nقبلاً Variant داشتند: ${r.skipped}`,
            detail: r.errors.length > 0 ? 'خطاها:\n' + r.errors.join('\n') : undefined,
          }
        }}
      />

      <ActionCard
        title="رفع ستون warranty_days / جداول گارانتی"
        description="اگر صفحه ایجاد/ویرایش محصول خطای 'column warranty_days does not exist' می‌دهد، یعنی migration روی سرور اجرا نشده. این دکمه مستقیماً ستون و جداول لازم را می‌سازد."
        buttonLabel="ساخت ستون و جداول گارانتی"
        onRun={async () => {
          const r = await fixWarrantySchema()
          return { ok: r.ok, message: r.message }
        }}
      />

      <ActionCard
        title="Seed داده‌های آنالیتیکس (۳۰ روز)"
        description="داده‌های نمایشی برای ۳۰ روز گذشته می‌سازد تا نمودارهای داشبورد پر شوند."
        warning="فقط در محیط تستی اجرا کنید — اگر داده واقعی دارید این را نزنید."
        buttonLabel="Seed آنالیتیکس"
        onRun={async () => {
          const r = await seedAnalyticsSnapshots()
          return { ok: true, message: `${r.seeded} روز داده با موفقیت ساخته شد` }
        }}
      />
    </div>
  )
}
