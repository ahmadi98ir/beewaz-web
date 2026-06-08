/**
 * GET  /api/admin/payment-gateways  — دریافت تنظیمات درگاه‌های پرداخت
 * PUT  /api/admin/payment-gateways  — ذخیره تنظیمات درگاه‌های پرداخت
 * POST /api/admin/payment-gateways  — مقداردهی اولیه
 */

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { siteSettings } from '@/lib/db/schema'
import { requireAdmin } from '@/lib/admin-auth'
import { eq, inArray } from 'drizzle-orm'
import { DEFAULT_SITE_SETTINGS } from '@/lib/db/schema/cms-seed'

const PAYMENT_KEYS = [
  'zarinpal_enabled',
  'zarinpal_merchant_id',
  'zarinpal_sandbox',
  'idpay_enabled',
  'idpay_api_key',
  'idpay_sandbox',
]

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const rows = await db
      .select()
      .from(siteSettings)
      .where(inArray(siteSettings.key, PAYMENT_KEYS))

    const values: Record<string, string> = {}
    for (const row of rows) {
      values[row.key] = row.value ?? ''
    }

    // مقادیر پیش‌فرض برای کلیدهای موجود نشده
    for (const key of PAYMENT_KEYS) {
      if (!(key in values)) values[key] = ''
    }

    return NextResponse.json({ values })
  } catch (err) {
    console.error('[payment-gateways GET]', err)
    return NextResponse.json({ error: 'خطا در دریافت تنظیمات' }, { status: 500 })
  }
}

// ── PUT ───────────────────────────────────────────────────────────────────────

export async function PUT(req: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json() as Record<string, string>

    const allowed = Object.entries(body).filter(([k]) => PAYMENT_KEYS.includes(k))
    if (allowed.length === 0) {
      return NextResponse.json({ error: 'هیچ کلید معتبری ارسال نشده' }, { status: 400 })
    }

    const updates = allowed.map(([key, value]) =>
      db
        .insert(siteSettings)
        .values({ key, value: String(value), label: key, group: 'payment', type: 'text' })
        .onConflictDoUpdate({
          target: siteSettings.key,
          set: { value: String(value), updatedAt: new Date() },
        }),
    )

    await Promise.all(updates)
    return NextResponse.json({ ok: true, updated: allowed.length })
  } catch (err) {
    console.error('[payment-gateways PUT]', err)
    return NextResponse.json({ error: 'خطا در ذخیره تنظیمات' }, { status: 500 })
  }
}

// ── POST (init) ───────────────────────────────────────────────────────────────

export async function POST() {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const paymentDefaults = DEFAULT_SITE_SETTINGS.filter((s) => s.group === 'payment')
    await db.insert(siteSettings).values(paymentDefaults).onConflictDoNothing()
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[payment-gateways POST]', err)
    return NextResponse.json({ error: 'خطا در مقداردهی اولیه' }, { status: 500 })
  }
}
