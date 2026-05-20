/**
 * GET  /api/admin/page-content?page=home   — دریافت محتوای یک صفحه
 * PUT  /api/admin/page-content             — ذخیره محتوا
 * POST /api/admin/page-content/init        — مقداردهی اولیه
 */

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { pageContent } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { requireAdmin } from '@/lib/admin-auth'
import { DEFAULT_PAGE_CONTENT } from '@/lib/db/schema/cms-seed'

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(req: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const page = searchParams.get('page') ?? 'home'

  try {
    const rows = await db
      .select()
      .from(pageContent)
      .where(eq(pageContent.page, page))
      .orderBy(pageContent.position, pageContent.key)

    return NextResponse.json({ page, content: rows })
  } catch (err) {
    console.error('[page-content GET]', err)
    return NextResponse.json({ error: 'خطا در دریافت محتوا' }, { status: 500 })
  }
}

// ── PUT ───────────────────────────────────────────────────────────────────────

export async function PUT(req: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json() as {
      page: string
      updates: Record<string, string>
    }

    const { page, updates } = body

    if (!page || !updates) {
      return NextResponse.json({ error: 'page و updates الزامی است' }, { status: 400 })
    }

    const ops = Object.entries(updates).map(([key, value]) =>
      db
        .insert(pageContent)
        .values({
          page,
          key,
          valueFa: String(value),
          label: key,
          type: 'text',
          position: 0,
        })
        .onConflictDoUpdate({
          target: [pageContent.page, pageContent.key],
          set: { valueFa: String(value), updatedAt: new Date() },
        }),
    )

    await Promise.all(ops)

    return NextResponse.json({ ok: true, updated: Object.keys(updates).length })
  } catch (err) {
    console.error('[page-content PUT]', err)
    return NextResponse.json({ error: 'خطا در ذخیره محتوا' }, { status: 500 })
  }
}

// ── POST /init ────────────────────────────────────────────────────────────────

export async function POST() {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await db
      .insert(pageContent)
      .values(DEFAULT_PAGE_CONTENT)
      .onConflictDoNothing()

    return NextResponse.json({ ok: true, inserted: DEFAULT_PAGE_CONTENT.length })
  } catch (err) {
    console.error('[page-content POST/init]', err)
    return NextResponse.json({ error: 'خطا در مقداردهی اولیه' }, { status: 500 })
  }
}
