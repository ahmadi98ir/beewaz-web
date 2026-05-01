import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { kbArticles } from '@/lib/mock-articles'

type Props = { params: Promise<{ category: string; slug: string }> }

export async function generateStaticParams() {
  return kbArticles.map((a) => ({ category: a.categorySlug, slug: a.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = kbArticles.find((a) => a.slug === slug)
  if (!article) return {}
  return {
    title: article.title,
    description: article.excerpt,
  }
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

export default async function KbArticlePage({ params }: Props) {
  const { category, slug } = await params
  const article = kbArticles.find((a) => a.slug === slug && a.categorySlug === category)
  if (!article) notFound()

  const related = kbArticles.filter((a) => a.id !== article.id && a.categorySlug === article.categorySlug).slice(0, 3)

  const publishDate = new Intl.DateTimeFormat('fa-IR', { dateStyle: 'long' }).format(new Date(article.publishedAt))

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-surface-100">
        <div className="container-main py-3">
          <nav className="flex items-center gap-2 text-xs text-surface-400" aria-label="breadcrumb">
            <Link href="/" className="hover:text-surface-700">خانه</Link>
            <span>/</span>
            <Link href="/knowledge-base" className="hover:text-surface-700">پایگاه دانش</Link>
            <span>/</span>
            <span className="text-surface-600">{article.categoryName}</span>
            <span>/</span>
            <span className="text-surface-900 font-medium line-clamp-1 max-w-xs">{article.title}</span>
          </nav>
        </div>
      </div>

      <div className="container-main py-10">
        <div className="lg:grid lg:grid-cols-3 lg:gap-10">

          {/* Main Content */}
          <article className="lg:col-span-2">
            {/* Header */}
            <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden mb-6">
              {/* Banner */}
              <div
                className="h-48 flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${article.from}, ${article.to})` }}
              >
                <svg className="w-20 h-20 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>

              <div className="p-6 lg:p-8">
                {/* Category + Tags */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="inline-flex px-3 py-1 rounded-lg text-xs font-bold bg-brand-50 text-brand-600 border border-brand-100">
                    {article.categoryName}
                  </span>
                  {article.tags.map((tag) => (
                    <span key={tag} className="inline-flex px-2.5 py-1 rounded-lg text-xs text-surface-500 bg-surface-100">
                      #{tag}
                    </span>
                  ))}
                </div>

                <h1 className="text-2xl lg:text-3xl font-black text-surface-900 leading-tight mb-4">
                  {article.title}
                </h1>

                <p className="text-surface-500 leading-relaxed mb-6">{article.excerpt}</p>

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-5 text-sm text-surface-400 pb-6 border-b border-surface-100">
                  <span className="flex items-center gap-1.5">
                    <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 text-xs font-bold">
                      {article.author[0]}
                    </div>
                    <div>
                      <p className="text-surface-700 font-semibold text-xs">{article.author}</p>
                      <p className="text-[10px]">{article.authorRole}</p>
                    </div>
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                    {publishDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                    {article.readTime} دقیقه مطالعه
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                    {article.views.toLocaleString('fa-IR')} بازدید
                  </span>
                </div>

                {/* Body */}
                <div className="mt-6 prose-sm max-w-none">
                  {renderBody(article.body)}
                </div>
              </div>
            </div>

            {/* Share */}
            <div className="bg-white rounded-2xl border border-surface-200 p-5 flex items-center justify-between">
              <p className="text-sm font-semibold text-surface-700">این مقاله را به اشتراک بگذارید:</p>
              <div className="flex items-center gap-2">
                {[
                  { label: 'تلگرام', color: 'bg-blue-500', icon: 'T' },
                  { label: 'واتساپ', color: 'bg-green-500', icon: 'W' },
                  { label: 'کپی لینک', color: 'bg-surface-200', icon: '🔗' },
                ].map((s) => (
                  <button key={s.label} title={s.label} className={`w-9 h-9 rounded-xl ${s.color} text-white text-xs font-bold flex items-center justify-center hover:opacity-80 transition-opacity`}>
                    {s.icon}
                  </button>
                ))}
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="mt-8 lg:mt-0 space-y-5">
            {/* Expert Contact */}
            <div className="bg-brand-600 rounded-2xl p-5 text-white text-center">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/></svg>
              </div>
              <p className="font-bold mb-1">مشاوره رایگان</p>
              <p className="text-white/70 text-xs mb-4">سوال دارید؟ با کارشناسان ما تماس بگیرید</p>
              <a href="tel:02100000000" className="btn bg-white text-brand-600 font-bold text-sm py-2 px-4 w-full">
                ۰۲۱-۰۰۰۰-۰۰۰۰
              </a>
            </div>

            {/* Related Articles */}
            {related.length > 0 && (
              <div className="bg-white rounded-2xl border border-surface-200 p-5">
                <h3 className="font-bold text-surface-900 mb-4 text-sm">مقالات مرتبط</h3>
                <div className="space-y-3">
                  {related.map((a) => (
                    <Link
                      key={a.id}
                      href={`/knowledge-base/${a.categorySlug}/${a.slug}`}
                      className="flex items-start gap-3 group"
                    >
                      <div
                        className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center"
                        style={{ background: `linear-gradient(135deg, ${a.from}, ${a.to})` }}
                      >
                        <svg className="w-5 h-5 opacity-40" fill="currentColor" viewBox="0 0 20 20"><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/></svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-surface-800 group-hover:text-brand-600 transition-colors line-clamp-2 leading-snug">
                          {a.title}
                        </p>
                        <p className="text-xs text-surface-400 mt-1">{a.readTime} دقیقه</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Back */}
            <Link
              href="/knowledge-base"
              className="flex items-center gap-2 text-sm text-surface-500 hover:text-brand-600 transition-colors"
            >
              <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              بازگشت به پایگاه دانش
            </Link>
          </aside>
        </div>
      </div>
    </div>
  )
}
