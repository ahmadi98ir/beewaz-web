/**
 * GET  /api/admin/settings        — دریافت همه تنظیمات (گروه‌بندی‌شده)
 * PUT  /api/admin/settings        — ذخیره یک یا چند تنظیم
 * POST /api/admin/settings/init   — مقداردهی اولیه با داده‌های پیش‌فرض
 */

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { siteSettings } from '@/lib/db/schema'
import { requireAdmin } from '@/lib/admin-auth'
import { DEFAULT_SITE_SETTINGS } from '@/lib/db/schema/cms-seed'

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET() {
  const auth = await requireAdmin()
  if ('error' in auth) return auth.error

  try {
    const rows = await db.select().from(siteSettings).orderBy(siteSettings.group, siteSettings.key)

    // گروه‌بندی بر اساس group
    const grouped: Record<string, typeof rows> = {}
    for (const row of rows) {
      if (!grouped[row.group]) grouped[row.group] = []
      grouped[row.group]!.push(row)
    }

    return NextResponse.json({ settings: rows, grouped })
  } catch (err) {
    console.error('[settings GET]', err)
    return NextResponse.json({ error: 'خطا در دریافت تنظیمات' }, { status: 500 })
  }
}

// ── PUT ───────────────────────────────────────────────────────────────────────

export async function PUT(req: Request) {
  const auth = await requireAdmin()
  if ('error' in auth) return auth.error

  try {
    const body = await req.json() as Record<string, string>

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'فرمت نادرست' }, { status: 400 })
    }

    // upsert هر کلید
    const updates = Object.entries(body).map(([key, value]) =>
      db
        .insert(siteSettings)
        .values({ key, value: String(value), label: key, group: 'general', type: 'text' })
        .onConflictDoUpdate({
          target: siteSettings.key,
          set: { value: String(value), updatedAt: new Date() },
        }),
    )

    await Promise.all(updates)

    return NextResponse.json({ ok: true, updated: Object.keys(body).length })
  } catch (err) {
    console.error('[settings PUT]', err)
    return NextResponse.json({ error: 'خطا در ذخیره تنظیمات' }, { status: 500 })
  }
}

// ── POST /init ────────────────────────────────────────────────────────────────
// مقداردهی اولیه — فقط یک‌بار اجرا می‌شود (onConflictDoNothing)

export async function POST() {
  const auth = await requireAdmin()
  if ('error' in auth) return auth.error

  try {
    await db
      .insert(siteSettings)
      .values(DEFAULT_SITE_SETTINGS)
      .onConflictDoNothing()

    return NextResponse.json({ ok: true, inserted: DEFAULT_SITE_SETTINGS.length })
  } catch (err) {
    console.error('[settings POST/init]', err)
    return NextResponse.json({ error: 'خطا در مقداردهی اولیه' }, { status: 500 })
  }
}
