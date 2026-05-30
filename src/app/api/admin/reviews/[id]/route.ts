import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { db } from '@/lib/db'
import { productReviews, products } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'

async function isAdmin() {
  const h = await headers()
  return h.get('x-admin-token') === process.env.ADMIN_TOKEN
}

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const body = await req.json() as { approved?: boolean }

  await db.update(productReviews).set({ approved: body.approved ?? true }).where(eq(productReviews.id, id))

  // recalculate rating_avg and rating_count for product
  const [review] = await db.select({ productId: productReviews.productId }).from(productReviews).where(eq(productReviews.id, id)).limit(1)
  if (review) {
    await db.execute(sql`
      UPDATE products SET
        rating_count = (SELECT COUNT(*) FROM product_reviews WHERE product_id = ${review.productId} AND approved = true),
        rating_avg   = COALESCE((SELECT AVG(rating) FROM product_reviews WHERE product_id = ${review.productId} AND approved = true), 0)
      WHERE id = ${review.productId}
    `)
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params

  const [review] = await db.select({ productId: productReviews.productId }).from(productReviews).where(eq(productReviews.id, id)).limit(1)
  await db.delete(productReviews).where(eq(productReviews.id, id))

  if (review) {
    await db.execute(sql`
      UPDATE products SET
        rating_count = (SELECT COUNT(*) FROM product_reviews WHERE product_id = ${review.productId} AND approved = true),
        rating_avg   = COALESCE((SELECT AVG(rating) FROM product_reviews WHERE product_id = ${review.productId} AND approved = true), 0)
      WHERE id = ${review.productId}
    `)
  }

  return NextResponse.json({ ok: true })
}
