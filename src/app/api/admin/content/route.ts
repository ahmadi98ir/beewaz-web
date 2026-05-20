/**
 * GET  /api/admin/content           -- page content blocks
 * POST /api/admin/content           -- upsert a page content block
 * GET  /api/admin/content?type=settings -- site settings
 * POST /api/admin/content/settings  -- upsert site setting
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { siteSettings, pageContent } from '@/lib/db/schema'
import { requireAdmin } from '@/lib/admin-auth'
import { eq, desc } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')
  const page = searchParams.get('page')

  try {
    if (type === 'settings') {
      const settings = await db.select().from(siteSettings).orderBy(siteSettings.group, siteSettings.key)
      return NextResponse.json({ settings })
    }

    const rows = page
      ? await db.select().from(pageContent).where(eq(pageContent.page, page)).orderBy(pageContent.position)
      : await db.select().from(pageContent).orderBy(pageContent.page, pageContent.position)
    return NextResponse.json({ content: rows })
  } catch (err) {
    console.error('[content GET]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json() as {
      type: 'setting' | 'page_content'
      // site setting fields
      key?: string
      value?: string
      label?: string
      group?: string
      // page content fields
      page?: string
      valueFa?: string
      valueEn?: string
      isActive?: boolean
    }

    if (body.type === 'setting') {
      if (!body.key) return NextResponse.json({ error: 'key is required' }, { status: 400 })
      const [setting] = await db
        .insert(siteSettings)
        .values({
          key: body.key,
          value: body.value ?? '',
          label: body.label ?? body.key,
          group: body.group ?? 'general',
        })
        .onConflictDoUpdate({
          target: siteSettings.key,
          set: { value: body.value ?? '' },
        })
        .returning()
      return NextResponse.json({ setting }, { status: 201 })
    }

    // page_content upsert
    if (!body.page || !body.key) {
      return NextResponse.json({ error: 'page and key are required' }, { status: 400 })
    }
    const [entry] = await db
      .insert(pageContent)
      .values({
        page: body.page,
        key: body.key,
        valueFa: body.valueFa ?? null,
        valueEn: body.valueEn ?? null,
        label: body.key,
        isActive: body.isActive ?? true,
      })
      .onConflictDoUpdate({
        target: [pageContent.page, pageContent.key],
        set: {
          valueFa: body.valueFa ?? null,
          valueEn: body.valueEn ?? null,
          isActive: body.isActive ?? true,
        }
      })
      .returning()
    return NextResponse.json({ entry }, { status: 201 })
  } catch (err) {
    console.error('[content POST]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
