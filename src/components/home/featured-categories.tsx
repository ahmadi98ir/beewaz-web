import Link from 'next/link'
import { AnimateIn } from '@/components/ui/animate-in'
import { mockCategories } from '@/lib/mock-data'

// SVG آیکون ساده برای هر دسته‌بندی
const categoryIcons: Record<string, React.ReactNode> = {
  sensors: (
    <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
      <circle cx="20" cy="20" r="8" stroke="currentColor" strokeWidth="2.5" />
      <path d="M20 4v4M20 32v4M4 20h4M32 20h4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="20" cy="20" r="3" fill="currentColor" />
    </svg>
  ),
  'central-alarm': (
    <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
      <rect x="6" y="10" width="28" height="20" rx="3" stroke="currentColor" strokeWidth="2.5" />
      <path d="M14 20h4M22 20h4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="30" cy="15" r="2" fill="currentColor" />
    </svg>
  ),
  sirens: (
    <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
      <path d="M20 8c-6.627 0-12 5.373-12 12v8h24v-8c0-6.627-5.373-12-12-12z" stroke="currentColor" strokeWidth="2.5" />
      <path d="M8 28h24M20 8v4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M10 16c1.5-4 5-7 10-7s8.5 3 10 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  control: (
    <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
      <rect x="8" y="8" width="24" height="24" rx="4" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="15" cy="16" r="2" fill="currentColor" />
      <circle cx="20" cy="16" r="2" fill="currentColor" />
      <circle cx="25" cy="16" r="2" fill="currentColor" />
      <rect x="13" y="22" width="14" height="4" rx="2" fill="currentColor" />
    </svg>
  ),
  boosters: (
    <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
      <path d="M20 32V16M14 26l6-10 6 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 20c0-6.627 5.373-12 12-12s12 5.373 12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M12 24c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  accessories: (
    <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
      <path d="M20 8l3 8h8l-6.5 5 2.5 8-7-5-7 5 2.5-8L9 16h8z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
  ),
}

export function FeaturedCategories() {
  return (
    <section className="py-16 lg:py-24 bg-surface-50" aria-label="دسته‌بندی محصولات">
      <div className="container-main">

        {/* Header */}
        <AnimateIn className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-sm font-semibold mb-4">
            دسته‌بندی محصولات
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-surface-900 mb-3">
            هر آنچه برای امنیت نیاز دارید
          </h2>
          <p className="text-surface-500 max-w-xl mx-auto">
            از حسگرهای پیشرفته تا دزدگیرهای هوشمند — کامل‌ترین مجموعه تجهیزات امنیتی ایران
          </p>
        </AnimateIn>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {mockCategories.map((cat, i) => (
            <AnimateIn key={cat.slug} delay={i * 70}>
              <Link
                href={`/shop/${cat.slug}`}
                className="group block rounded-2xl p-5 text-center transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                style={{ background: cat.bgColor }}
              >
                {/* آیکون */}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: cat.color + '20', color: cat.color }}
                >
                  {categoryIcons[cat.slug]}
                </div>

                {/* نام */}
                <p className="text-sm font-bold text-surface-800 mb-1">
                  {cat.nameFa}
                </p>

                {/* تعداد محصول */}
                <p className="text-xs font-medium" style={{ color: cat.color }}>
                  {cat.productCount} محصول
                </p>
              </Link>
            </AnimateIn>
          ))}
        </div>

        {/* لینک مشاهده همه */}
        <AnimateIn className="text-center mt-10">
          <Link
            href="/shop"
            className="btn btn-outline px-8"
          >
            مشاهده همه محصولات
          </Link>
        </AnimateIn>

      </div>
    </section>
  )
}
