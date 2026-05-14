import Link from 'next/link'
import { AnimateIn } from '@/components/ui/animate-in'
import { ProductCard } from '@/components/shop/product-card'
import { ArrowLeftIcon } from '@/components/ui/icons'
import { db } from '@/lib/db'
import { products, categories, productImages } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { dbProductToShop } from '@/lib/shop-product'

async function getFeatured() {
  try {
    const [rows, imageRows] = await Promise.all([
      db
        .select({
          id: products.id,
          slug: products.slug,
          sku: products.sku,
          nameFa: products.nameFa,
          descriptionFa: products.descriptionFa,
          price: products.price,
          comparePrice: products.comparePrice,
          stock: products.stock,
          isFeatured: products.isFeatured,
          createdAt: products.createdAt,
          categorySlug: categories.slug,
          categoryName: categories.nameFa,
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .where(and(eq(products.isFeatured, true), eq(products.status, 'active')))
        .orderBy(desc(products.createdAt))
        .limit(8),

      db
        .select({ productId: productImages.productId, url: productImages.url, alt: productImages.alt })
        .from(productImages)
        .orderBy(productImages.sortOrder),
    ])

    const imagesByProduct = imageRows.reduce<Record<string, { url: string; alt: string | null }[]>>(
      (acc, img) => {
        if (!acc[img.productId]) acc[img.productId] = []
        acc[img.productId]!.push({ url: img.url, alt: img.alt })
        return acc
      },
      {},
    )

    return rows.map((r) =>
      dbProductToShop({
        ...r,
        category: r.categorySlug ? { slug: r.categorySlug, nameFa: r.categoryName ?? '' } : null,
        images: imagesByProduct[r.id] ?? [],
      }),
    )
  } catch {
    return []
  }
}

export async function FeaturedProducts() {
  const featuredProducts = await getFeatured()

  if (featuredProducts.length === 0) return null

  return (
    <section className="py-16 lg:py-24" aria-label="محصولات ویژه">
      <div className="container-main">

        <AnimateIn>
          <div className="flex items-end justify-between mb-10 gap-4 flex-wrap">
            <div>
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-semibold mb-3"
                style={{ background: 'rgb(249 115 22 / 0.08)', borderColor: 'rgb(249 115 22 / 0.3)', color: '#EA6C00' }}
              >
                <span className="w-2 h-2 rounded-full bg-accent-500 animate-pulse" />
                پرفروش‌ترین‌ها
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-surface-900">
                محصولات ویژه{' '}
                <span className="text-gradient-brand">بیواز</span>
              </h2>
            </div>

            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-sm font-semibold transition-colors group"
              style={{ color: '#F97316' }}
            >
              مشاهده همه
              <ArrowLeftIcon size={16} className="transition-transform group-hover:-translate-x-1" />
            </Link>
          </div>
        </AnimateIn>

        {/* دسکتاپ: گرید */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {featuredProducts.map((product, i) => (
            <AnimateIn key={product.id} delay={i * 80}>
              <ProductCard product={product} />
            </AnimateIn>
          ))}
        </div>

        {/* موبایل: کاروسل افقی سینماتیک */}
        <div className="sm:hidden -mx-4 px-4">
          <div className="cards-carousel">
            {featuredProducts.map((product) => (
              <div key={product.id} className="flex-shrink-0" style={{ width: '76vw', maxWidth: '300px' }}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
          {/* نشانگر اسکرول */}
          <p className="text-center text-xs text-surface-400 mt-3">← بکشید برای دیدن بیشتر →</p>
        </div>

      </div>
    </section>
  )
}
