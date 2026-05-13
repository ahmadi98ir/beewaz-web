import { NextRequest, NextResponse } from 'next/server'
import { desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { articles, users } from '@/lib/db/schema'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET() {
  const guard = await requireAdmin()
  if (guard.error) return guard.error

  try {
    const allArticles = await db
      .select({
        id: articles.id,
        category: articles.category,
        status: articles.status,
        titleFa: articles.titleFa,
        slug: articles.slug,
        excerptFa: articles.excerptFa,
        readingTime: articles.readingTime,
        tags: articles.tags,
        publishedAt: articles.publishedAt,
        createdAt: articles.createdAt,
        authorId: articles.authorId,
        authorName: users.fullName,
      })
      .from(articles)
      .leftJoin(users, eq(articles.authorId, users.id))
      .orderBy(desc(articles.createdAt))

    return NextResponse.json({ articles: allArticles })
  } catch (err) {
    console.error('[API GET /admin/articles]', err)
    return NextResponse.json({ error: 'خطا در بارگیری مقالات' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const guard = await requireAdmin()
  if (guard.error) return guard.error

  try {
    const body = await req.json()
    const { titleFa, slug, category, bodyFa, excerptFa, status, readingTime, tags, metaTitle, metaDesc } = body

    if (!titleFa || !slug || !category || !bodyFa) {
      return NextResponse.json({ error: 'فیلدهای اجباری کامل نیستند' }, { status: 400 })
    }

    const [article] = await db
      .insert(articles)
      .values({
        titleFa,
        slug,
        category,
        bodyFa,
        excerptFa: excerptFa ?? null,
        status: status ?? 'draft',
        readingTime: readingTime ?? null,
        tags: tags ?? [],
        metaTitle: metaTitle ?? null,
        metaDesc: metaDesc ?? null,
      })
      .returning()

    return NextResponse.json({ article }, { status: 201 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : ''
    if (msg.includes('unique') || msg.includes('duplicate')) {
      return NextResponse.json({ error: 'اسلاگ تکراری است' }, { status: 409 })
    }
    console.error('[API POST /admin/articles]', err)
    return NextResponse.json({ error: 'خطا در ایجاد مقاله' }, { status: 500 })
  }
}
