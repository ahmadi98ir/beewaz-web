import Link from 'next/link'
import type { Metadata } from 'next'
import { kbArticles, kbCategories } from '@/lib/mock-articles'
import { AnimateIn } from '@/components/ui/animate-in'

export const metadata: Metadata = {
  title: 'پایگاه دانش',
  description: 'راهنماهای کامل نصب، خرید و عیب‌یابی سیستم‌های دزدگیر و امنیتی بیواز',
}

function ArticleCard({ article, featured = false }: {
  article: typeof kbArticles[0]
  featured?: boolean
}) {
  return (
    <Link
      href={`/knowledge-base/${article.categorySlug}/${article.slug}`}
      className={`group block bg-white rounded-2xl border border-surface-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ${featured ? 'lg:flex' : ''}`}
    >
      {/* Placeholder banner */}
      <div
        className={`${featured ? 'lg:w-64 lg:flex-shrink-0 h-48 lg:h-auto' : 'h-44'} flex items-center justify-center relative overflow-hidden`}
        style={{ background: `linear-gradient(135deg, ${article.from}, ${article.to})` }}
      >
        <svg className="w-16 h-16 opacity-20" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="absolute top-3 start-3 bg-white/90 text-surface-700 text-[10px] font-bold px-2 py-1 rounded-lg">
          {article.categoryName}
        </span>
      </div>

      <div className={`p-5 ${featured ? 'flex flex-col justify-center' : ''}`}>
        <h3 className={`font-bold text-surface-900 group-hover:text-brand-600 transition-colors leading-snug ${featured ? 'text-lg mb-3' : 'text-sm mb-2 line-clamp-2'}`}>
          {article.title}
        </h3>
        {featured && (
          <p className="text-sm text-surface-500 leading-relaxed mb-4 line-clamp-2">{article.excerpt}</p>
        )}
        <div className="flex items-center gap-3 text-xs text-surface-400 mt-auto">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
            </svg>
            {article.readTime} دقیقه
          </span>
          <span>·</span>
          <span>{article.author}</span>
          <span className="ms-auto flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
            {article.views.toLocaleString('fa-IR')}
          </span>
        </div>
      </div>
    </Link>
  )
}

export default function KnowledgeBasePage() {
  const featured = kbArticles.filter((a) => a.isFeatured)
  const rest = kbArticles.filter((a) => !a.isFeatured)

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-surface-900 to-surface-800 text-white py-16">
        <div className="container-main text-center">
          <AnimateIn>
            <div className="inline-flex items-center gap-2 bg-brand-600/20 border border-brand-500/30 text-brand-300 text-xs font-semibold px-4 py-2 rounded-full mb-6">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              پایگاه دانش بیواز
            </div>
            <h1 className="text-3xl lg:text-4xl font-black mb-4">
              همه چیز درباره سیستم‌های امنیتی
            </h1>
            <p className="text-surface-300 max-w-xl mx-auto leading-relaxed">
              راهنماهای کامل نصب، خرید و عیب‌یابی سیستم‌های دزدگیر توسط متخصصان بیواز
            </p>
          </AnimateIn>

          {/* Category pills */}
          <AnimateIn delay={100}>
            <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
              {kbCategories.map((cat) => (
                <a
                  key={cat.slug}
                  href={`#${cat.slug}`}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-white/10 hover:bg-brand-600 border border-white/10 hover:border-brand-600 text-white/80 hover:text-white transition-all"
                >
                  {cat.name}
                </a>
              ))}
            </div>
          </AnimateIn>
        </div>
      </section>

      <div className="container-main py-12 space-y-16">

        {/* Featured Articles */}
        {featured.length > 0 && (
          <section>
            <AnimateIn>
              <h2 className="text-lg font-black text-surface-900 mb-6 flex items-center gap-2">
                <span className="w-1 h-5 bg-brand-600 rounded-full" />
                مقالات ویژه
              </h2>
            </AnimateIn>
            <div className="space-y-4">
              {featured.map((a, i) => (
                <AnimateIn key={a.id} delay={i * 80}>
                  <ArticleCard article={a} featured />
                </AnimateIn>
              ))}
            </div>
          </section>
        )}

        {/* By Category */}
        {kbCategories.map((cat) => {
          const catArticles = kbArticles.filter((a) => a.categorySlug === cat.slug)
          if (!catArticles.length) return null
          return (
            <section key={cat.slug} id={cat.slug}>
              <AnimateIn>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-black text-surface-900 flex items-center gap-2">
                    <span className="w-1 h-5 bg-brand-600 rounded-full" />
                    {cat.name}
                  </h2>
                  <span className="text-xs text-surface-400">{catArticles.length} مقاله</span>
                </div>
              </AnimateIn>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {catArticles.map((a, i) => (
                  <AnimateIn key={a.id} delay={i * 60}>
                    <ArticleCard article={a} />
                  </AnimateIn>
                ))}
              </div>
            </section>
          )
        })}

        {/* CTA */}
        <AnimateIn>
          <div className="bg-brand-600 rounded-3xl p-8 text-white text-center">
            <h3 className="text-xl font-black mb-2">سوال دارید؟</h3>
            <p className="text-white/80 text-sm mb-6">کارشناسان ما آماده پاسخگویی هستند</p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <a href="tel:02100000000" className="btn bg-white text-brand-600 hover:bg-surface-50 px-6 py-2.5 text-sm font-bold">
                تماس بگیرید
              </a>
              <a href="#chat" className="btn border border-white/30 text-white hover:bg-white/10 px-6 py-2.5 text-sm">
                چت آنلاین
              </a>
            </div>
          </div>
        </AnimateIn>

      </div>
    </div>
  )
}
