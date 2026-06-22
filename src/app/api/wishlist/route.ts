import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { wishlistItems, products, categories, productImages } from '@/lib/db/schema'
import { eq, and, desc, inArray } from 'drizzle-orm'
import { dbProductToShop } from '@/lib/shop-product'

const schema = z.object({ productId: z.string().uuid() })

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rows = await db
    .select({
      id:            products.id,
      slug:          products.slug,
      sku:           products.sku,
      nameFa:        products.nameFa,
      descriptionFa: products.descriptionFa,
      price:         products.price,
      comparePrice:  products.comparePrice,
      stock:         products.stock,
      isFeatured:    products.isFeatured,
      createdAt:     products.createdAt,
      ratingAvg:     products.ratingAvg,
      ratingCount:   products.ratingCount,
      categorySlug:  categories.slug,
      categoryName:  categories.nameFa,
    })
    .from(wishlistItems)
    .innerJoin(products, eq(products.id, wishlistItems.productId))
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(wishlistItems.userId, session.user.id))
    .orderBy(desc(wishlistItems.createdAt))

  const productIds = rows.map((r) => r.id)
  const imageRows = productIds.length
    ? await db
        .select({ productId: productImages.productId, url: productImages.url, alt: productImages.alt })
        .from(productImages)
        .where(inArray(productImages.productId, productIds))
        .orderBy(productImages.sortOrder)
    : []

  const imagesByProduct = imageRows.reduce<Record<string, { url: string; alt: string | null }[]>>(
    (acc, img) => {
      if (!acc[img.productId]) acc[img.productId] = []
      acc[img.productId]!.push({ url: img.url, alt: img.alt })
      return acc
    },
    {},
  )

  const items = rows.map((r) =>
    dbProductToShop({
      ...r,
      category: r.categorySlug ? { slug: r.categorySlug, nameFa: r.categoryName ?? '' } : null,
      images: imagesByProduct[r.id] ?? [],
    }),
  )

  return NextResponse.json({ items })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id || session.user.id === 'admin-env') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json() as unknown
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'شناسه محصول معتبر نیست' }, { status: 400 })
  }

  const [product] = await db.select({ id: products.id }).from(products)
    .where(eq(products.id, parsed.data.productId)).limit(1)
  if (!product) return NextResponse.json({ error: 'محصول یافت نشد' }, { status: 404 })

  await db.insert(wishlistItems)
    .values({ userId: session.user.id, productId: parsed.data.productId })
    .onConflictDoNothing()

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const parsed = schema.safeParse({ productId: searchParams.get('productId') })
  if (!parsed.success) {
    return NextResponse.json({ error: 'شناسه محصول معتبر نیست' }, { status: 400 })
  }

  await db.delete(wishlistItems)
    .where(and(eq(wishlistItems.userId, session.user.id), eq(wishlistItems.productId, parsed.data.productId)))

  return NextResponse.json({ ok: true })
}
