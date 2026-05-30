/**
 * GET  /api/admin/pages  — لیست صفحات
 * POST /api/admin/pages  — ساخت صفحه جدید
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { pages } from '@/lib/db/schema'
import { requireAdmin } from '@/lib/admin-auth'
import { desc } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const allPages = await db
    .select({
      id:          pages.id,
      slug:        pages.slug,
      titleFa:     pages.titleFa,
      status:      pages.status,
      publishedAt: pages.publishedAt,
      updatedAt:   pages.updatedAt,
    })
    .from(pages)
    .orderBy(desc(pages.updatedAt))

  return NextResponse.json({ pages: allPages })
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as { titleFa: string; slug: string }
  if (!body.titleFa?.trim() || !body.slug?.trim())
    return NextResponse.json({ error: 'عنوان و slug الزامی است' }, { status: 400 })

  const slug = body.slug.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w؀-ۿ-]/g, '')

  const [page] = await db
    .insert(pages)
    .values({ titleFa: body.titleFa.trim(), slug, blocks: [] })
    .returning()

  return NextResponse.json({ page }, { status: 201 })
}
