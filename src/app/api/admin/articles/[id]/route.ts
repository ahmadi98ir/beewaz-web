import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { articles } from '@/lib/db/schema'
import { requireAdmin } from '@/lib/admin-auth'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const guard = await requireAdmin()
  if (guard.error) return guard.error

  const { id } = await params
  const [article] = await db.select().from(articles).where(eq(articles.id, id))

  if (!article) return NextResponse.json({ error: 'مقاله یافت نشد' }, { status: 404 })
  return NextResponse.json({ article })
}

export async function PUT(req: NextRequest, { params }: Params) {
  const guard = await requireAdmin()
  if (guard.error) return guard.error

  const { id } = await params
  try {
    const body = await req.json()
    const { titleFa, slug, category, bodyFa, excerptFa, status, readingTime, tags, metaTitle, metaDesc } = body

    const [article] = await db
      .update(articles)
      .set({
        ...(titleFa !== undefined && { titleFa }),
        ...(slug !== undefined && { slug }),
        ...(category !== undefined && { category }),
        ...(bodyFa !== undefined && { bodyFa }),
        ...(excerptFa !== undefined && { excerptFa }),
        ...(status !== undefined && { status }),
        ...(readingTime !== undefined && { readingTime }),
        ...(tags !== undefined && { tags }),
        ...(metaTitle !== undefined && { metaTitle }),
        ...(metaDesc !== undefined && { metaDesc }),
        updatedAt: new Date(),
      })
      .where(eq(articles.id, id))
      .returning()

    if (!article) return NextResponse.json({ error: 'مقاله یافت نشد' }, { status: 404 })
    return NextResponse.json({ article })
  } catch (err) {
    const msg = err instanceof Error ? err.message : ''
    if (msg.includes('unique') || msg.includes('duplicate')) {
      return NextResponse.json({ error: 'اسلاگ تکراری است' }, { status: 409 })
    }
    console.error('[API PUT /admin/articles/:id]', err)
    return NextResponse.json({ error: 'خطا در ویرایش' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const guard = await requireAdmin()
  if (guard.error) return guard.error

  const { id } = await params
  const [deleted] = await db.delete(articles).where(eq(articles.id, id)).returning({ id: articles.id })

  if (!deleted) return NextResponse.json({ error: 'مقاله یافت نشد' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
