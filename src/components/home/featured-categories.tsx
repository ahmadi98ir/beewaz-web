import Link from 'next/link'
import { db } from '@/lib/db'
import { categories } from '@/lib/db/schema'
import { asc, isNull } from 'drizzle-orm'
import { AnimateIn } from '@/components/ui/animate-in'

export async function FeaturedCategories() {
  let cats: { id: string; nameFa: string; slug: string; icon: string | null }[] = []
  try {
    cats = await db.select({ id: categories.id, nameFa: categories.nameFa, slug: categories.slug, icon: categories.icon })
      .from(categories).where(isNull(categories.parentId)).orderBy(asc(categories.sortOrder)).limit(6)
  } catch { return null }
  if (cats.length === 0) return null

  return (
    <section className="py-14 sm:py-20 bg-white">
      <div className="container-page">
        <AnimateIn direction="up" className="text-center mb-10">
          <div className="orange-divider mx-auto mb-4" />
          <h2 className="text-2xl sm:text-3xl font-black text-surface-900 mb-2">دسته‌بندی محصولات</h2>
          <p className="text-surface-500">انواع تجهیزات امنیتی برای هر نیاز</p>
        </AnimateIn>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {cats.map((cat, i) => (
            <AnimateIn key={cat.id} direction="up" delay={i * 70}>
              <Link href={`/shop?category=${cat.slug}`}
                className="group flex flex-col items-center gap-3 p-4 rounded-2xl border border-surface-100 hover:border-brand-200 hover:bg-brand-50 transition-all text-center hover-lift">
                <div className="w-14 h-14 rounded-xl bg-brand-100 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-200">
                  {cat.icon ?? '🔒'}
                </div>
                <span className="text-sm font-semibold text-surface-800 group-hover:text-brand-700 leading-tight">{cat.nameFa}</span>
              </Link>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  )
}
