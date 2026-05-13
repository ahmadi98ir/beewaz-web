import type { Metadata } from 'next'
import { ShopClient } from './shop-client'
import { db } from '@/lib/db'
import { products, categories } from '@/lib/db/schema'
import { eq, and, desc, sql } from 'drizzle-orm'
import { dbProductToShop } from '@/lib/shop-product'
import type { ShopCategory } from '@/lib/shop-product'

export const metadata: Metadata = {
  title: 'فروشگاه',
  description: 'خرید آنلاین سیستم دزدگیر، حسگر، سیرن و تجهیزات امنیتی. بیش از ۸۰ محصول اصل با گارانتی رسمی.',
}

export const dynamic = 'force-dynamic'

type Props = {
  searchParams: Promise<{ q?: string; category?: string }>
}

export default async function ShopPage({ searchParams }: Props) {
  const { q, category } = await searchParams

  let shopProducts: import('@/lib/shop-product').ShopProduct[] = []
  let shopCategories: ShopCategory[] = []

  try {
    const [productRows, categoryRows] = await Promise.all([
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
        .where(eq(products.status, 'active'))
        .orderBy(desc(products.isFeatured), desc(products.createdAt)),

      db
        .select({
          id: categories.id,
          slug: categories.slug,
          nameFa: categories.nameFa,
          sortOrder: categories.sortOrder,
          productCount: sql<number>`count(case when ${products.status} = 'active' then 1 end)::int`,
        })
        .from(categories)
        .leftJoin(products, and(eq(products.categoryId, categories.id), eq(products.status, 'active')))
        .groupBy(categories.id)
        .orderBy(categories.sortOrder, categories.nameFa),
    ])

    shopProducts = productRows.map((r) =>
      dbProductToShop({
        ...r,
        category: r.categorySlug ? { slug: r.categorySlug, nameFa: r.categoryName ?? '' } : null,
      }),
    )

    shopCategories = categoryRows.map((r) => ({
      slug: r.slug,
      nameFa: r.nameFa,
      productCount: r.productCount,
    }))
  } catch {
    // DB unavailable — show empty shop
  }

  return (
    <ShopClient
      initialQuery={q}
      initialCategory={category}
      products={shopProducts}
      categories={shopCategories}
    />
  )
}
