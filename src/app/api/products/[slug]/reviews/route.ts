import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { products, productReviews } from '@/lib/db/schema'
import { eq, and, desc, sql } from 'drizzle-orm'

type Params = { params: Promise<{ slug: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { slug } = await params
  const [product] = await db.select({ id: products.id }).from(products).where(eq(products.slug, slug)).limit(1)
  if (!product) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const reviews = await db
    .select({
      id: productReviews.id,
      authorName: productReviews.authorName,
      rating: productReviews.rating,
      body: productReviews.body,
      createdAt: productReviews.createdAt,
    })
    .from(productReviews)
    .where(and(eq(productReviews.productId, product.id), eq(productReviews.approved, true)))
    .orderBy(desc(productReviews.createdAt))
    .limit(50)

  return NextResponse.json({ reviews })
}

export async function POST(req: NextRequest, { params }: Params) {
  const { slug } = await params
  const session = await auth()

  const [product] = await db
    .select({ id: products.id })
    .from(products)
    .where(and(eq(products.slug, slug), eq(products.status, 'active')))
    .limit(1)

  if (!product) return NextResponse.json({ error: 'محصول یافت نشد' }, { status: 404 })

  const body = await req.json() as { rating?: unknown; body?: unknown; authorName?: unknown }
  const rating = Number(body.rating)
  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'امتیاز باید بین ۱ تا ۵ باشد' }, { status: 400 })
  }

  const authorName = session?.user?.name
    ?? (typeof body.authorName === 'string' && body.authorName.trim() ? body.authorName.trim() : null)
  if (!authorName) return NextResponse.json({ error: 'نام الزامی است' }, { status: 400 })

  const reviewBody = typeof body.body === 'string' ? body.body.trim() || null : null

  await db.insert(productReviews).values({
    productId: product.id,
    userId: session?.user?.id && session.user.id !== 'admin-env' ? session.user.id : null,
    authorName,
    rating,
    body: reviewBody,
    approved: false,
  })

  return NextResponse.json({ ok: true, message: 'نظر شما ثبت شد و پس از تأیید نمایش داده می‌شود.' })
}
