import Link from 'next/link'
import { db } from '@/lib/db'
import { categories } from '@/lib/db/schema'
import { asc, isNull } from 'drizzle-orm'

export async function FeaturedCategories() {
  let cats: { id: string; nameFa: string; slug: string; icon: string | null }[] = []

  try {
    cats = await db
      .select({
        id: categories.id,
        nameFa: categories.nameFa,
        slug: categories.slug,
        icon: categories.icon,
      })
      .from(categories)
      .where(isNull(categories.parentId))
      .orderBy(asc(categories.sortOrder))
      .limit(6)
  } catch {
    return null
  }

  if (cats.length === 0) return null

  return (
    <section className="py-14 sm:py-20 bg-white">
      <div className="container-page">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-surface-900 mb-2">
            دسته‌بندی محصولات
          </h2>
          <p className="text-surface-400">انواع تجهیزات امنیتی برای هر نیاز</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {cats.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.slug}`}
              className="group flex flex-col items-center gap-3 p-4 rounded-2xl border border-surface-100 hover:border-brand-200 hover:bg-brand-50 transition-all text-center"
            >
              <div className="w-14 h-14 rounded-xl bg-brand-100 flex items-center justify-center text-2xl">
                {cat.icon ?? '🔒'}
              </div>
              <span className="text-sm font-semibold text-surface-800 group-hover:text-brand-700 leading-tight">
                {cat.nameFa}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
