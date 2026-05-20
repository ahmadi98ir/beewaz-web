/**
 * GET    /api/admin/products/[id] — جزئیات کامل محصول
 * PUT    /api/admin/products/[id] — ویرایش کامل
 * DELETE /api/admin/products/[id] — حذف نرم
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { products, productImages, productVariants, categories } from '@/lib/db/schema'
import { requireAdmin } from '@/lib/admin-auth'
import { eq, and, isNull } from 'drizzle-orm'

type Params = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  try {
    const [product] = await db.select().from(products).where(and(eq(products.id, id), isNull(products.deletedAt))).limit(1)
    if (!product) return NextResponse.json({ error: 'محصول یافت نشد' }, { status: 404 })

    const [images, variants] = await Promise.all([
      db.select().from(productImages).where(eq(productImages.productId, id)).orderBy(productImages.position),
      db.select().from(productVariants).where(eq(productVariants.productId, id)).orderBy(productVariants.position),
    ])

    return NextResponse.json({ product, images, variants })
  } catch (err) {
    console.error('[product GET]', err)
    return NextResponse.json({ error: 'خطا' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  try {
    const body = await req.json() as Record<string, unknown>
    const allowed = ['name','slug','modelCode','shortDescription','description','highlights',
      'basePrice','compareAtPrice','status','isFeatured','categoryId','warrantyMonths',
      'warrantyDescription','metaTitle','metaDescription','specs','attributes']

    // biome-ignore lint/suspicious/noExplicitAny: dynamic update
    const update: Record<string, any> = { updatedAt: new Date() }
    for (const key of allowed) {
      if (body[key] !== undefined) update[key] = body[key]
    }
    if (body.status === 'active' && !body.publishedAt) update.publishedAt = new Date()
    if (body.basePrice) update.basePrice = String(body.basePrice)
    if (body.compareAtPrice) update.compareAtPrice = String(body.compareAtPrice)

    const [updated] = await db.update(products).set(update).where(eq(products.id, id)).returning()
    if (!updated) return NextResponse.json({ error: 'محصول یافت نشد' }, { status: 404 })

    return NextResponse.json({ product: updated })
  } catch (err) {
    console.error('[product PUT]', err)
    return NextResponse.json({ error: 'خطا' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  try {
    await db.update(products).set({ deletedAt: new Date() }).where(eq(products.id, id))
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: 'خطا' }, { status: 500 })
  }
}
