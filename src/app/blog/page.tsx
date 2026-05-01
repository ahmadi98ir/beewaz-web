import Link from 'next/link'
import type { Metadata } from 'next'
import { blogArticles, blogCategories } from '@/lib/mock-articles'
import { AnimateIn } from '@/components/ui/animate-in'

export const metadata: Metadata = {
  title: 'وبلاگ',
  description: 'آخرین اخبار، نکات امنیتی و بررسی محصولات بیواز',
}

export default function BlogPage() {
  const featured = blogArticles.filter((a) => a.isFeatured)
  const rest = blogArticles.filter((a) => !a.isFeatured)

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-white border-b border-surface-200 py-12">
        <div className="container-main">
          <AnimateIn>
            <p className="text-brand-600 font-bold text-sm mb-2">وبلاگ بیواز</p>
            <h1 className="text-3xl lg:text-4xl font-black text-surface-900 mb-3">اخبار و نکات امنیتی</h1>
            <p className="text-surface-500 max-w-lg">
              جدیدترین مقالات، معرفی محصولات و راهنماهای امنیتی از تیم متخصص بیواز
            </p>
          </AnimateIn>

          {/* Category filter */}
          <AnimateIn delay={80}>
            <div className="flex flex-wrap gap-2 mt-6">
              <span className="px-4 py-1.5 rounded-xl text-sm font-bold bg-brand-600 text-white">همه</span>
              {blogCategories.map((cat) => (
                <span key={cat.slug} className="px-4 py-1.5 rounded-xl text-sm font-semibold bg-surface-100 text-surface-600 hover:bg-surface-200 cursor-pointer transition-colors">
                  {cat.name}
                </span>
              ))}
            </div>
          </AnimateIn>
        </div>
      </section>

      <div className="container-main py-12">
        {/* Featured — big card */}
        {featured[0] && (
          <AnimateIn>
            {(() => {
              const top = featured[0]
              return (
                <div className="mb-12">
                  <Link
                    href={`/blog/${top.slug}`}
                    className="group grid lg:grid-cols-2 gap-0 bg-white rounded-3xl border border-surface-200 overflow-hidden hover:shadow-xl transition-all duration-300"
                  >
                    <div
                      className="h-64 lg:h-auto flex items-center justify-center"
                      style={{ background: `linear-gradient(135deg, ${top.from}, ${top.to})` }}
                    >
                      <svg className="w-24 h-24 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                      </svg>
                    </div>
                    <div className="p-8 lg:p-10 flex flex-col justify-center">
                      <span className="inline-flex px-3 py-1 rounded-lg text-xs font-bold bg-brand-50 text-brand-600 border border-brand-100 mb-4 w-fit">
                        {top.categoryName}
                      </span>
                      <h2 className="text-2xl font-black text-surface-900 group-hover:text-brand-600 transition-colors leading-snug mb-3">
                        {top.title}
                      </h2>
                      <p className="text-surface-500 leading-relaxed mb-6 line-clamp-3">{top.excerpt}</p>
                      <div className="flex items-center gap-4 text-xs text-surface-400">
                        <span>{top.author}</span>
                        <span>·</span>
                        <span>{top.readTime} دقیقه مطالعه</span>
                        <span>·</span>
                        <span>{top.views.toLocaleString('fa-IR')} بازدید</span>
                      </div>
                    </div>
                  </Link>
                </div>
              )
            })()}
          </AnimateIn>
        )}

        {/* Rest of featured + regular */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...featured.slice(1), ...rest].map((article, i) => (
            <AnimateIn key={article.id} delay={i * 60}>
              <Link
                href={`/blog/${article.slug}`}
                className="group block bg-white rounded-2xl border border-surface-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full"
              >
                <div
                  className="h-44 flex items-center justify-center relative"
                  style={{ background: `linear-gradient(135deg, ${article.from}, ${article.to})` }}
                >
                  <svg className="w-14 h-14 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                  <span className="absolute top-3 start-3 bg-white/90 text-surface-700 text-[10px] font-bold px-2 py-1 rounded-lg">
                    {article.categoryName}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-surface-900 group-hover:text-brand-600 transition-colors line-clamp-2 leading-snug mb-2">
                    {article.title}
                  </h3>
                  <p className="text-xs text-surface-500 line-clamp-2 leading-relaxed mb-4">{article.excerpt}</p>
                  <div className="flex items-center gap-3 text-xs text-surface-400">
                    <span>{article.readTime} دقیقه</span>
                    <span>·</span>
                    <span>{article.views.toLocaleString('fa-IR')} بازدید</span>
                    <span className="ms-auto text-brand-600 font-semibold group-hover:underline">بخوانید ←</span>
                  </div>
                </div>
              </Link>
            </AnimateIn>
          ))}
        </div>
      </div>
    </div>
  )
}
