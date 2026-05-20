import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { products, productImages } from '@/lib/db/schema'
import { requireAdmin } from '@/lib/admin-auth'
import { eq, desc, ilike, or, sql, and, isNull, inArray } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const search = searchParams.get('q')?.trim()
  const page   = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit  = Math.min(100, parseInt(searchParams.get('limit') ?? '50', 10))
  const offset = (page - 1) * limit

  try {
    const conditions = [isNull(products.deletedAt)]
    if (status && status !== 'all')
      conditions.push(eq(products.status, status as 'draft'|'active'|'archived'|'out_of_stock'))
    if (search) {
      const searchCond = or(ilike(products.nameFa, `%${search}%`), ilike(products.slug, `%${search}%`))
      if (searchCond) conditions.push(searchCond)
    }

    const where = and(...conditions)

    const [rows, countResult, statusCounts] = await Promise.all([
      db.select({
        id: products.id, slug: products.slug, nameFa: products.nameFa,
        sku: products.sku, status: products.status,
        price: products.price, isFeatured: products.isFeatured,
        ratingAvg: products.ratingAvg, ratingCount: products.ratingCount,
        createdAt: products.createdAt,
      }).from(products).where(where).orderBy(desc(products.createdAt)).limit(limit).offset(offset),

      db.select({ total: sql<number>`count(*)::int` }).from(products).where(where),
      db.select({ status: products.status, count: sql<number>`count(*)::int` })
        .from(products).where(isNull(products.deletedAt)).groupBy(products.status),
    ])

    const productIds = rows.map(r => r.id)
    let imageMap: Record<string, string> = {}
    if (productIds.length > 0) {
      const imgs = await db.select({ productId: productImages.productId, url: productImages.url })
        .from(productImages)
        .where(and(eq(productImages.isPrimary, true), inArray(productImages.productId, productIds)))
      imageMap = Object.fromEntries(imgs.map(i => [i.productId, i.url]))
    }

    const counts: Record<string, number> = { all: countResult[0]?.total ?? 0 }
    for (const r of statusCounts) counts[r.status] = r.count

    return NextResponse.json({
      products: rows.map(r => ({
        id: r.id, slug: r.slug,
        name: r.nameFa, modelCode: r.sku,
        status: r.status, basePrice: String(r.price ?? 0),
        isFeatured: r.isFeatured,
        ratingAvg: r.ratingAvg, ratingCount: r.ratingCount,
        imageUrl: imageMap[r.id] ?? null,
      })),
      total: countResult[0]?.total ?? 0,
      counts,
    })
  } catch (err) {
    console.error('[products GET]', err)
    return NextResponse.json({ error: 'خطا' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json() as {
      name: string; slug: string; modelCode?: string
      shortDescription?: string; basePrice?: number
      status?: string; isFeatured?: boolean; categoryId?: string
    }
    if (!body.name || !body.slug)
      return NextResponse.json({ error: 'نام و slug الزامی است' }, { status: 400 })

    const [product] = await db.insert(products).values({
      nameFa: body.name,
      slug: body.slug,
      sku: body.modelCode ?? body.slug,
      descriptionFa: body.shortDescription ?? null,
      price: body.basePrice ?? 0,
      status: (body.status as 'draft'|'active') ?? 'draft',
      isFeatured: body.isFeatured ?? false,
      categoryId: body.categoryId ?? null,
    }).returning()

    return NextResponse.json({ product }, { status: 201 })
  } catch (err) {
    console.error('[products POST]', err)
    return NextResponse.json({ error: 'خطا در ایجاد محصول' }, { status: 500 })
  }
}
