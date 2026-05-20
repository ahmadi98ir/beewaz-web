/**
 * GET  /api/admin/content         -- list page content entries
 * POST /api/admin/content         -- upsert a content block
 * GET  /api/admin/content/settings -- site settings
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

  try {
    if (type === 'settings') {
      const settings = await db.select().from(siteSettings).orderBy(siteSettings.key)
      return NextResponse.json({ settings })
    }

    const content = await db.select().from(pageContent).orderBy(desc(pageContent.updatedAt))
    return NextResponse.json({ content })
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
      key: string
      value?: string
      contentType?: string
      title?: string
      body?: string
      isPublished?: boolean
    }

    if (body.type === 'setting') {
      if (!body.key) return NextResponse.json({ error: 'key is required' }, { status: 400 })
      const [setting] = await db.insert(siteSettings)
        .values({ key: body.key, value: body.value ?? '' })
        .onConflictDoUpdate({ target: siteSettings.key, set: { value: body.value ?? '', updatedAt: new Date() } })
        .returning()
      return NextResponse.json({ setting }, { status: 201 })
    }

    if (!body.key) return NextResponse.json({ error: 'key is required' }, { status: 400 })
    const [entry] = await db.insert(pageContent)
      .values({
        key: body.key,
        contentType: (body.contentType as 'text' | 'html' | 'json' | 'markdown') ?? 'text',
        title: body.title ?? null,
        body: body.body ?? null,
        isPublished: body.isPublished ?? false,
      })
      .onConflictDoUpdate({
        target: pageContent.key,
        set: {
          title: body.title ?? null,
          body: body.body ?? null,
          isPublished: body.isPublished ?? false,
          updatedAt: new Date(),
        }
      })
      .returning()
    return NextResponse.json({ entry }, { status: 201 })
  } catch (err) {
    console.error('[content POST]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
