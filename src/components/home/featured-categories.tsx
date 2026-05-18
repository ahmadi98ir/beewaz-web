import Link from 'next/link'
import { db } from '@/lib/db'
import { categories } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'

export async function FeaturedCategories() {
  let cats: { id: string; name: string; slug: string; description: string | null; imageUrl: string | null }[] = []

  try {
    cats = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        description: categories.description,
        imageUrl: categories.imageUrl,
      })
      .from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(asc(categories.position))
      .limit(6)
  } catch {
    // DB خطا — بخش را مخفی می‌کنیم
    return null
  }

  if (cats.length === 0) return null

  return (
    <section className="py-14 sm:py-20 bg-white">
      <div className="container-page">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-surface-900 mb-2">دسته‌بندی محصولات</h2>
          <p className="text-surface-400">انواع تجهیزات امنیتی برای هر نیاز</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {cats.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop/${cat.slug}`}
              className="group flex flex-col items-center gap-3 p-4 rounded-2xl border border-surface-100 hover:border-brand-200 hover:bg-brand-50 transition-all text-center"
            >
              {cat.imageUrl ? (
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-surface-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cat.imageUrl}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                  />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-xl bg-brand-100 flex items-center justify-center text-2xl">
                  🔒
                </div>
              )}
              <span className="text-sm font-semibold text-surface-800 group-hover:text-brand-700 leading-tight">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
