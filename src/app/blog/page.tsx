import { db } from '@/lib/db'
import { articles } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'وبلاگ بیواز | آموزش و اخبار دزدگیر',
  description: 'مقالات آموزشی و اخبار حوزه سیستم‌های امنیتی و دزدگیر',
}

export const revalidate = 3600

async function getArticles() {
  try {
    return await db
      .select({
        id: articles.id,
        slug: articles.slug,
        titleFa: articles.titleFa,
        excerptFa: articles.excerptFa,
        coverImage: articles.coverImage,
        tags: articles.tags,
        readingTime: articles.readingTime,
        publishedAt: articles.publishedAt,
      })
      .from(articles)
      .where(eq(articles.status, 'published'))
      .orderBy(desc(articles.publishedAt))
      .limit(24)
  } catch {
    return []
  }
}

function formatDate(d: Date | null) {
  if (!d) return ''
  return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' }).format(d)
}

export default async function BlogPage() {
  const posts = await getArticles()

  return (
    <main className="min-h-screen bg-surface-50">
      <section className="bg-surface-950 text-white py-16">
        <div className="container-main text-center">
          <h1 className="text-3xl sm:text-4xl font-black mb-3">وبلاگ بیواز</h1>
          <p className="text-white/60 max-w-lg mx-auto">آموزش، نکات فنی و اخبار حوزه سیستم‌های امنیتی</p>
        </div>
      </section>

      <div className="container-main py-12">
        {posts.length === 0 ? (
          <div className="text-center py-20 text-surface-400">
            <p className="text-lg">به زودی مقالات اینجا منتشر می‌شوند</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group bg-white rounded-2xl border border-surface-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                {post.coverImage ? (
                  <div className="aspect-video overflow-hidden">
                    <img src={post.coverImage} alt={post.titleFa} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-brand-900 to-accent-500 flex items-center justify-center">
                    <svg className="w-10 h-10 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                )}
                <div className="p-5">
                  <h2 className="font-bold text-surface-900 mb-2 group-hover:text-accent-600 transition-colors line-clamp-2">{post.titleFa}</h2>
                  {post.excerptFa && <p className="text-sm text-surface-500 line-clamp-2 mb-3">{post.excerptFa}</p>}
                  <div className="flex items-center justify-between text-xs text-surface-400">
                    <span>{formatDate(post.publishedAt)}</span>
                    {post.readingTime && <span>{post.readingTime} دقیقه مطالعه</span>}
                  </div>
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="px-2 py-0.5 bg-surface-100 text-surface-500 rounded-full text-xs">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}