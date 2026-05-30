/**
 * GET    /api/admin/pages/[id]  — جزئیات صفحه
 * PATCH  /api/admin/pages/[id]  — ذخیره محتوا
 * DELETE /api/admin/pages/[id]  — حذف صفحه
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { pages } from '@/lib/db/schema'
import { requireAdmin } from '@/lib/admin-auth'
import { eq } from 'drizzle-orm'
import type { Block } from '@/lib/db/schema'

type Params = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const [page] = await db.select().from(pages).where(eq(pages.id, id)).limit(1)
  if (!page) return NextResponse.json({ error: 'صفحه یافت نشد' }, { status: 404 })

  return NextResponse.json({ page })
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const body = await req.json() as {
    titleFa?:  string
    slug?:     string
    status?:   'draft' | 'published'
    blocks?:   Block[]
    metaTitle?: string
    metaDesc?:  string
    ogImage?:   string
  }

  const now = new Date()
  const [updated] = await db
    .update(pages)
    .set({
      ...(body.titleFa  !== undefined && { titleFa:  body.titleFa }),
      ...(body.slug     !== undefined && { slug:     body.slug }),
      ...(body.blocks   !== undefined && { blocks:   body.blocks }),
      ...(body.metaTitle !== undefined && { metaTitle: body.metaTitle }),
      ...(body.metaDesc  !== undefined && { metaDesc:  body.metaDesc }),
      ...(body.ogImage   !== undefined && { ogImage:   body.ogImage }),
      ...(body.status !== undefined && {
        status:      body.status,
        publishedAt: body.status === 'published' ? now : null,
      }),
      updatedAt: now,
    })
    .where(eq(pages.id, id))
    .returning()

  return NextResponse.json({ page: updated })
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  await db.delete(pages).where(eq(pages.id, id))
  return NextResponse.json({ ok: true })
}
