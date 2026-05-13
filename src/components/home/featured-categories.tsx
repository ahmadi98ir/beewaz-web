import Link from 'next/link'
import { AnimateIn } from '@/components/ui/animate-in'
import { db } from '@/lib/db'
import { categories, products } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'
import { mockCategories } from '@/lib/mock-data'

// آیکون ساده برای هر دسته‌بندی
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
  default: (
    <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
      <rect x="8" y="8" width="24" height="24" rx="4" stroke="currentColor" strokeWidth="2.5" />
      <path d="M14 20h12M20 14v12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  ),
}

const BG_COLORS = ['#EFF6FF', '#ECFDF5', '#FFF7ED', '#F5F3FF', '#FDF2F8', '#FFFBEB']
const ICON_COLORS = ['#3B82F6', '#10B981', '#F97316', '#8B5CF6', '#EC4899', '#F59E0B']

async function getCategories() {
  try {
    const rows = await db
      .select({
        id: categories.id,
        slug: categories.slug,
        nameFa: categories.nameFa,
        sortOrder: categories.sortOrder,
        productCount: sql<number>`count(${products.id})::int`,
      })
      .from(categories)
      .leftJoin(products, eq(products.categoryId, categories.id))
      .groupBy(categories.id)
      .orderBy(categories.sortOrder, categories.nameFa)

    return rows
  } catch {
    return null
  }
}

export async function FeaturedCategories() {
  const dbCategories = await getCategories()

  // اگر DB دسته‌بندی ندارد، از mock استفاده می‌کنیم
  if (!dbCategories || dbCategories.length === 0) {
    return <FeaturedCategoriesStatic />
  }

  return (
    <section className="py-16 lg:py-24 bg-surface-50" aria-label="دسته‌بندی محصولات">
      <div className="container-main">
        <AnimateIn className="text-center mb-12">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-semibold mb-4"
            style={{ background: 'rgb(249 115 22 / 0.08)', borderColor: 'rgb(249 115 22 / 0.25)', color: '#EA6C00' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent-500" />
            دسته‌بندی محصولات
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-surface-900 mb-3">
            هر آنچه برای امنیت نیاز دارید
          </h2>
          <div className="orange-divider w-16 mx-auto mb-4" />
          <p className="text-surface-500 max-w-xl mx-auto">
            از حسگرهای پیشرفته تا دزدگیرهای هوشمند — کامل‌ترین مجموعه تجهیزات امنیتی ایران
          </p>
        </AnimateIn>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {dbCategories.slice(0, 6).map((cat, i) => {
            const bgColor = BG_COLORS[i % BG_COLORS.length]!
            const iconColor = ICON_COLORS[i % ICON_COLORS.length]!
            const icon = categoryIcons[cat.slug] ?? categoryIcons.default

            return (
              <AnimateIn key={cat.id} delay={i * 80} direction="scale">
                <Link
                  href={`/shop?category=${cat.slug}`}
                  className="group block rounded-2xl p-5 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-lg cursor-pointer border border-transparent hover:border-accent-200"
                  style={{ background: bgColor }}
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                    style={{ background: iconColor + '20', color: iconColor }}
                  >
                    {icon}
                  </div>
                  <p className="text-sm font-bold text-surface-800 mb-1 group-hover:text-surface-900 transition-colors">
                    {cat.nameFa}
                  </p>
                  <p className="text-xs font-semibold transition-colors group-hover:text-accent-500" style={{ color: iconColor }}>
                    {cat.productCount} محصول
                  </p>
                </Link>
              </AnimateIn>
            )
          })}
        </div>

        <AnimateIn className="text-center mt-10">
          <Link href="/shop" className="btn btn-accent px-8 orange-glow-sm">
            مشاهده همه محصولات
          </Link>
        </AnimateIn>
      </div>
    </section>
  )
}

// Fallback برای زمانی که DB هنوز دسته‌بندی ندارد
function FeaturedCategoriesStatic() {
  return (
    <section className="py-16 lg:py-24 bg-surface-50" aria-label="دسته‌بندی محصولات">
      <div className="container-main">
        <AnimateIn className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black text-surface-900 mb-3">
            هر آنچه برای امنیت نیاز دارید
          </h2>
          <div className="orange-divider w-16 mx-auto mb-4" />
          <p className="text-surface-500 max-w-xl mx-auto">
            از حسگرهای پیشرفته تا دزدگیرهای هوشمند — کامل‌ترین مجموعه تجهیزات امنیتی ایران
          </p>
        </AnimateIn>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {mockCategories.map((cat, i) => {
            const icon = categoryIcons[cat.slug] ?? categoryIcons.default
            return (
              <AnimateIn key={cat.slug} delay={i * 80} direction="scale">
                <Link
                  href={`/shop?category=${cat.slug}`}
                  className="group block rounded-2xl p-5 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-lg cursor-pointer border border-transparent hover:border-accent-200"
                  style={{ background: cat.bgColor }}
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                    style={{ background: cat.color + '20', color: cat.color }}
                  >
                    {icon}
                  </div>
                  <p className="text-sm font-bold text-surface-800 mb-1">{cat.nameFa}</p>
                  <p className="text-xs font-semibold" style={{ color: cat.color }}>{cat.productCount} محصول</p>
                </Link>
              </AnimateIn>
            )
          })}
        </div>

        <AnimateIn className="text-center mt-10">
          <Link href="/shop" className="btn btn-accent px-8 orange-glow-sm">
            مشاهده همه محصولات
          </Link>
        </AnimateIn>
      </div>
    </section>
  )
}
