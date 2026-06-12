import Link from 'next/link'
import { notFound } from 'next/navigation'
import { desc, eq, isNull, and } from 'drizzle-orm'
import { db } from '@/lib/db'
import { products, productImages } from '@/lib/db/schema/products'
import { categories } from '@/lib/db/schema/categories'
import { isValidLocale, getDictionary } from '@/lib/i18n'
import type { Locale } from '@/lib/i18n'
import { ProductCard } from '@/components/product-card'
import type { ProductCardData } from '@/components/product-card'

export default async function LangHomePage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  if (!isValidLocale(lang)) notFound()

  const dict = await getDictionary(lang as Locale)

  const [catRows, productRows] = await Promise.all([
    db
      .select({ id: categories.id, nameFa: categories.nameFa, slug: categories.slug, icon: categories.icon })
      .from(categories)
      .orderBy(categories.sortOrder)
      .limit(8),
    db
      .select({
        id: products.id,
        slug: products.slug,
        nameFa: products.nameFa,
        price: products.price,
        comparePrice: products.comparePrice,
        stock: products.stock,
        categoryName: categories.nameFa,
        imageUrl: productImages.url,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(
        productImages,
        and(eq(productImages.productId, products.id), eq(productImages.isPrimary, true)),
      )
      .where(and(eq(products.status, 'active'), isNull(products.deletedAt)))
      .orderBy(desc(products.createdAt))
      .limit(8),
  ])

  const cardProducts: ProductCardData[] = productRows.map((r) => ({
    id: r.id,
    slug: r.slug,
    nameFa: r.nameFa,
    price: r.price,
    comparePrice: r.comparePrice ?? null,
    stock: r.stock,
    categoryName: r.categoryName ?? null,
    imageUrl: r.imageUrl ?? null,
  }))

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-transparent to-purple-900/10 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            {dict.home.heroTitle}
          </h1>
          <p className="text-lg text-white/60 mb-8 max-w-2xl mx-auto">
            {dict.home.heroSubtitle}
          </p>
          <Link
            href={`/${lang}/shop`}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors duration-200 text-base"
          >
            {dict.home.heroCta}
          </Link>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-3 mt-10">
            {dict.home.trustBadges.map((badge) => (
              <span
                key={badge}
                className="px-4 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-white/60 text-sm"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {catRows.length > 0 && (
        <section className="py-12 px-4 max-w-6xl mx-auto">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white">{dict.home.categoriesTitle}</h2>
            <p className="text-sm text-white/40 mt-1">{dict.home.categoriesSubtitle}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {catRows.map((cat) => (
              <Link
                key={cat.id}
                href={`/${lang}/shop?category=${cat.slug}`}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:border-indigo-500/30 hover:bg-white/[0.06] transition-all duration-200"
              >
                {cat.icon && <span className="text-3xl">{cat.icon}</span>}
                <span className="text-sm text-white/80 font-medium text-center">{cat.nameFa}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Latest Products */}
      <section className="py-12 px-4 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">{dict.home.latestTitle}</h2>
            <p className="text-sm text-white/40 mt-1">{dict.home.latestSubtitle}</p>
          </div>
          <Link
            href={`/${lang}/shop`}
            className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            {dict.home.viewAll}
          </Link>
        </div>

        {cardProducts.length === 0 ? (
          <p className="text-white/40 text-sm text-center py-12">{dict.home.noProducts}</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {cardProducts.map((p) => (
              <ProductCard key={p.id} product={p} lang={lang} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
