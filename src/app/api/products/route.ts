import { NextRequest, NextResponse } from 'next/server'
import { eq, and, ilike, desc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { products, categories } from '@/lib/db/schema'
import { dbProductToShop } from '@/lib/shop-product'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const search = searchParams.get('search') ?? ''
  const categorySlug = searchParams.get('category') ?? ''
  const featured = searchParams.get('featured') === 'true'

  try {
    const conditions = [eq(products.status, 'active')]

    if (featured) {
      conditions.push(eq(products.isFeatured, true))
    }

    if (search.trim().length >= 2) {
      conditions.push(ilike(products.nameFa, `%${search.trim()}%`))
    }

    const rows = await db
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
      .where(and(...conditions))
      .orderBy(desc(products.isFeatured), desc(products.createdAt))
      .limit(200)

    // filter by category after join (simpler than a subquery)
    const filtered = categorySlug
      ? rows.filter((r) => r.categorySlug === categorySlug)
      : rows

    const shopProducts = filtered.map((r) =>
      dbProductToShop({
        ...r,
        category: r.categorySlug ? { slug: r.categorySlug, nameFa: r.categoryName ?? '' } : null,
      }),
    )

    return NextResponse.json({ products: shopProducts })
  } catch (err) {
    console.error('[API GET /api/products]', err)
    return NextResponse.json({ products: [] })
  }
}
