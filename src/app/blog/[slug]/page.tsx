import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { blogArticles } from '@/lib/mock-articles'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return blogArticles.map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = blogArticles.find((a) => a.slug === slug)
  if (!article) return {}
  return { title: article.title, description: article.excerpt }
}

function renderBody(body: string) {
  return body.split('\n\n').map((block, i) => {
    if (block.startsWith('### ')) {
      return <h3 key={i} className="text-lg font-bold text-surface-900 mt-6 mb-2">{block.slice(4)}</h3>
    }
    if (block.startsWith('## ')) {
      return <h2 key={i} className="text-xl font-black text-surface-900 mt-8 mb-3 pt-4 border-t border-surface-100 first:border-0 first:pt-0">{block.slice(3)}</h2>
    }
    const lines = block.split('\n')
    if (lines.every((l) => l.startsWith('- '))) {
      return (
        <ul key={i} className="my-4 space-y-2">
          {lines.map((l, j) => (
            <li key={j} className="flex items-start gap-2 text-surface-700">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-600 flex-shrink-0 mt-2" />
              {l.slice(2)}
            </li>
          ))}
        </ul>
      )
    }
    return <p key={i} className="text-surface-700 leading-relaxed my-3">{block}</p>
  })
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const article = blogArticles.find((a) => a.slug === slug)
  if (!article) notFound()

  const related = blogArticles.filter((a) => a.id !== article.id).slice(0, 3)
  const publishDate = new Intl.DateTimeFormat('fa-IR', { dateStyle: 'long' }).format(new Date(article.publishedAt))

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-surface-100">
        <div className="container-main py-3">
          <nav className="flex items-center gap-2 text-xs text-surface-400">
            <Link href="/" className="hover:text-surface-700">خانه</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-surface-700">وبلاگ</Link>
            <span>/</span>
            <span className="text-surface-900 font-medium line-clamp-1">{article.title}</span>
          </nav>
        </div>
      </div>

      <div className="container-main py-10">
        <div className="lg:grid lg:grid-cols-3 lg:gap-10">

          <article className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
              {/* Banner */}
              <div
                className="h-56 flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${article.from}, ${article.to})` }}
              >
                <svg className="w-20 h-20 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>

              <div className="p-6 lg:p-8">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="inline-flex px-3 py-1 rounded-lg text-xs font-bold bg-brand-50 text-brand-600 border border-brand-100">
                    {article.categoryName}
                  </span>
                  {article.tags.map((tag) => (
                    <span key={tag} className="text-xs text-surface-400 bg-surface-100 px-2.5 py-1 rounded-lg">#{tag}</span>
                  ))}
                </div>

                <h1 className="text-2xl lg:text-3xl font-black text-surface-900 leading-tight mb-4">{article.title}</h1>
                <p className="text-surface-500 leading-relaxed mb-6">{article.excerpt}</p>

                <div className="flex flex-wrap items-center gap-5 text-sm text-surface-400 pb-6 border-b border-surface-100">
                  <span className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 text-xs font-bold">
                      {article.author[0]}
                    </div>
                    <div>
                      <p className="text-surface-700 font-semibold text-xs">{article.author}</p>
                      <p className="text-[10px]">{article.authorRole}</p>
                    </div>
                  </span>
                  <span className="flex items-center gap-1 text-xs">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                    {publishDate}
                  </span>
                  <span className="flex items-center gap-1 text-xs">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                    {article.readTime} دقیقه مطالعه
                  </span>
                </div>

                <div className="mt-6">{renderBody(article.body)}</div>
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="mt-8 lg:mt-0 space-y-5">
            <div className="bg-white rounded-2xl border border-surface-200 p-5">
              <h3 className="font-bold text-surface-900 mb-4 text-sm">مقالات بیشتر</h3>
              <div className="space-y-4">
                {related.map((a) => (
                  <Link key={a.id} href={`/blog/${a.slug}`} className="flex items-start gap-3 group">
                    <div
                      className="w-12 h-12 rounded-xl flex-shrink-0"
                      style={{ background: `linear-gradient(135deg, ${a.from}, ${a.to})` }}
                    />
                    <div>
                      <p className="text-sm font-semibold text-surface-800 group-hover:text-brand-600 transition-colors line-clamp-2 leading-snug">{a.title}</p>
                      <p className="text-xs text-surface-400 mt-1">{a.readTime} دقیقه</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <Link href="/blog" className="flex items-center gap-2 text-sm text-surface-500 hover:text-brand-600 transition-colors">
              <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
              بازگشت به وبلاگ
            </Link>
          </aside>
        </div>
      </div>
    </div>
  )
}
