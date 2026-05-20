/**
 * GET  /api/admin/cms  — دریافت همه تنظیمات + محتوای صفحات
 * PUT  /api/admin/cms  — ذخیره دسته‌ای تنظیمات و محتوا
 * POST /api/admin/cms/seed — مقداردهی اولیه پیش‌فرض‌ها
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { siteSettings, pageContent } from '@/lib/db/schema'
import { requireAdmin } from '@/lib/admin-auth'
import { eq, and } from 'drizzle-orm'
import { DEFAULT_SITE_SETTINGS } from '@/lib/db/schema/cms-seed'

// ── GET ───────────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const [settings, content] = await Promise.all([
      db.select().from(siteSettings).orderBy(siteSettings.group, siteSettings.key),
      db.select().from(pageContent).orderBy(pageContent.page, pageContent.position),
    ])

    // گروه‌بندی settings
    const settingsByGroup: Record<string, typeof settings> = {}
    for (const s of settings) {
      if (!settingsByGroup[s.group]) settingsByGroup[s.group] = []
      settingsByGroup[s.group]!.push(s)
    }

    // گروه‌بندی content بر اساس page
    const contentByPage: Record<string, typeof content> = {}
    for (const c of content) {
      if (!contentByPage[c.page]) contentByPage[c.page] = []
      contentByPage[c.page]!.push(c)
    }

    // flat map برای UI
    const settingsMap: Record<string, string> = {}
    for (const s of settings) settingsMap[s.key] = s.value ?? ''

    const contentMap: Record<string, Record<string, string>> = {}
    for (const c of content) {
      if (!contentMap[c.page]) contentMap[c.page] = {}
      contentMap[c.page]![c.key] = c.valueFa ?? ''
    }

    return NextResponse.json({ settings, content, settingsByGroup, contentByPage, settingsMap, contentMap })
  } catch (err) {
    console.error('[cms GET]', err)
    return NextResponse.json({ error: 'خطا' }, { status: 500 })
  }
}

// ── PUT — ذخیره دسته‌ای ───────────────────────────────────────────────────────
export async function PUT(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json() as {
      settings?: Record<string, string>
      content?: Record<string, Record<string, string>> // { page: { key: value } }
    }

    const ops: Promise<unknown>[] = []

    // ذخیره site_settings
    if (body.settings) {
      for (const [key, value] of Object.entries(body.settings)) {
        ops.push(
          db.insert(siteSettings)
            .values({ key, value, label: key, group: 'general', type: 'text' })
            .onConflictDoUpdate({ target: siteSettings.key, set: { value, updatedAt: new Date() } })
        )
      }
    }

    // ذخیره page_content
    if (body.content) {
      for (const [page, keys] of Object.entries(body.content)) {
        for (const [key, valueFa] of Object.entries(keys)) {
          ops.push(
            db.insert(pageContent)
              .values({ page, key, valueFa, label: key, type: 'text' })
              .onConflictDoUpdate({
                target: [pageContent.page, pageContent.key],
                set: { valueFa, updatedAt: new Date() },
              })
          )
        }
      }
    }

    await Promise.all(ops)
    return NextResponse.json({ ok: true, updated: ops.length })
  } catch (err) {
    console.error('[cms PUT]', err)
    return NextResponse.json({ error: 'خطا در ذخیره' }, { status: 500 })
  }
}

// ── POST /seed ────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await db.insert(siteSettings).values(DEFAULT_SITE_SETTINGS).onConflictDoNothing()
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: 'خطا' }, { status: 500 })
  }
}