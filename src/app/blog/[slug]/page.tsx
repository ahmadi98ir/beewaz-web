import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { articles } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import Link from 'next/link'
import type { Metadata } from 'next'

export const revalidate = 3600

async function getArticle(slug: string) {
  try {
    const [row] = await db
      .select()
      .from(articles)
      .where(and(eq(articles.slug, slug), eq(articles.status, 'published')))
      .limit(1)
    return row ?? null
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) return { title: 'مقاله یافت نشد' }
  return {
    title: article.metaTitle ?? article.titleFa,
    description: article.metaDesc ?? article.excerptFa ?? undefined,
    openGraph: article.coverImage ? { images: [article.coverImage] } : undefined,
  }
}

function formatDate(d: Date | null) {
  if (!d) return ''
  return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' }).format(d)
}

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) notFound()

  return (
    <main className="min-h-screen bg-surface-50">
      {article.coverImage && (
        <div className="h-64 sm:h-96 overflow-hidden">
          <img src={article.coverImage} alt={article.titleFa} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="container-main max-w-3xl py-10">
        <Link href="/blog" className="text-sm text-accent-600 hover:underline mb-6 inline-block">← بازگشت به وبلاگ</Link>

        <h1 className="text-2xl sm:text-3xl font-black text-surface-900 mb-4">{article.titleFa}</h1>

        <div className="flex flex-wrap gap-4 text-sm text-surface-400 mb-6">
          {article.publishedAt && <span>{formatDate(article.publishedAt)}</span>}
          {article.readingTime && <span>{article.readingTime} دقیقه مطالعه</span>}
        </div>

        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {article.tags.map((tag) => (
              <span key={tag} className="px-3 py-1 bg-surface-100 text-surface-600 rounded-full text-xs font-medium">{tag}</span>
            ))}
          </div>
        )}

        <article className="prose prose-lg max-w-none text-surface-700 leading-relaxed whitespace-pre-wrap">
          {article.bodyFa}
        </article>
      </div>
    </main>
  )
}