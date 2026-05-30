import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { db } from '@/lib/db'
import { productReviews, products } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const pending = req.nextUrl.searchParams.get('pending') === '1'

  const rows = await db
    .select({
      id: productReviews.id,
      productId: productReviews.productId,
      productName: products.nameFa,
      authorName: productReviews.authorName,
      rating: productReviews.rating,
      body: productReviews.body,
      approved: productReviews.approved,
      createdAt: productReviews.createdAt,
    })
    .from(productReviews)
    .leftJoin(products, eq(productReviews.productId, products.id))
    .where(pending ? eq(productReviews.approved, false) : undefined)
    .orderBy(desc(productReviews.createdAt))
    .limit(100)

  return NextResponse.json({ reviews: rows })
}
