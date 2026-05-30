import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { db } from '@/lib/db'
import { productReviews } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json() as { approved?: boolean }

  await db.update(productReviews).set({ approved: body.approved ?? true }).where(eq(productReviews.id, id))

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

export async function DELETE(req: NextRequest, { params }: Params) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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
