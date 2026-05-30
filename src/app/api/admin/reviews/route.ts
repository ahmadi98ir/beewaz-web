import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { db } from '@/lib/db'
import { productReviews, products } from '@/lib/db/schema'
import { eq, desc, sql } from 'drizzle-orm'

async function isAdmin() {
  const h = await headers()
  return h.get('x-admin-token') === process.env.ADMIN_TOKEN
}

export async function GET(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

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
