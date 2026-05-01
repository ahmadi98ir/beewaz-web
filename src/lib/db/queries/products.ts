import { eq, and, desc, ilike, sql } from 'drizzle-orm'
import { db } from '../index'
import { products, productImages, productSpecs, categories } from '../schema'

export async function getProductBySlug(slug: string) {
  return db.query.products.findFirst({
    where: and(eq(products.slug, slug), eq(products.status, 'active')),
    with: {
      category: true,
      images: { orderBy: productImages.sortOrder },
      specs: { orderBy: productSpecs.sortOrder },
    },
  })
}

export async function getProductsByCategorySlug(
  categorySlug: string,
  opts?: { page?: number; limit?: number },
) {
  const page = opts?.page ?? 1
  const limit = opts?.limit ?? 24
  const offset = (page - 1) * limit

  const category = await db.query.categories.findFirst({
    where: eq(categories.slug, categorySlug),
  })

  if (!category) return { items: [], total: 0, category: null }

  const [items, [{ count }]] = await Promise.all([
    db.query.products.findMany({
      where: and(
        eq(products.categoryId, category.id),
        eq(products.status, 'active'),
      ),
      with: { images: { limit: 1, orderBy: productImages.sortOrder } },
      orderBy: [desc(products.isFeatured), desc(products.createdAt)],
      limit,
      offset,
    }),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(products)
      .where(
        and(
          eq(products.categoryId, category.id),
          eq(products.status, 'active'),
        ),
      ),
  ])

  return { items, total: count, category }
}

export async function getFeaturedProducts(limit = 8) {
  return db.query.products.findMany({
    where: and(eq(products.isFeatured, true), eq(products.status, 'active')),
    with: { images: { limit: 1, orderBy: productImages.sortOrder } },
    orderBy: desc(products.createdAt),
    limit,
  })
}

export async function searchProducts(query: string, limit = 20) {
  return db.query.products.findMany({
    where: and(
      eq(products.status, 'active'),
      ilike(products.nameFa, `%${query}%`),
    ),
    with: { images: { limit: 1 } },
    limit,
  })
}
