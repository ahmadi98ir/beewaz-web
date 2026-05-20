import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { products, productImages, productVariants } from '@/lib/db/schema'
import { requireAdmin } from '@/lib/admin-auth'
import { eq, and, isNull } from 'drizzle-orm'

type Params = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  try {
    const [product] = await db.select().from(products)
      .where(and(eq(products.id, id), isNull(products.deletedAt))).limit(1)
    if (!product) return NextResponse.json({ error: 'محصول یافت نشد' }, { status: 404 })

    const [images, variants] = await Promise.all([
      db.select().from(productImages)
        .where(eq(productImages.productId, id)).orderBy(productImages.sortOrder),
      db.select().from(productVariants)
        .where(eq(productVariants.productId, id)).orderBy(productVariants.createdAt),
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

    const update: Partial<typeof products.$inferInsert> = {}
    if (typeof body.nameFa === 'string')       update.nameFa       = body.nameFa
    if (typeof body.name === 'string')          update.nameFa       = body.name as string
    if (typeof body.slug === 'string')          update.slug         = body.slug as string
    if (typeof body.sku === 'string')           update.sku          = body.sku as string
    if (typeof body.descriptionFa === 'string') update.descriptionFa = body.descriptionFa
    if (typeof body.price === 'number')         update.price        = body.price as number
    if (typeof body.basePrice === 'number')     update.price        = body.basePrice as number
    if (typeof body.comparePrice === 'number')  update.comparePrice = body.comparePrice as number
    if (typeof body.stock === 'number')         update.stock        = body.stock as number
    if (typeof body.status === 'string')        update.status       = body.status as typeof products.$inferInsert['status']
    if (typeof body.isFeatured === 'boolean')   update.isFeatured   = body.isFeatured as boolean
    if (typeof body.categoryId === 'string')    update.categoryId   = body.categoryId as string
    if (typeof body.metaTitle === 'string')     update.metaTitle    = body.metaTitle
    if (typeof body.metaDesc === 'string')      update.metaDesc     = body.metaDesc

    const [updated] = await db.update(products).set(update).where(eq(products.id, id)).returning()
    return NextResponse.json({ product: updated })
  } catch (err) {
    console.error('[product PUT]', err)
    return NextResponse.json({ error: 'خطا در ویرایش' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  try {
    await db.update(products)
      .set({ deletedAt: new Date() })
      .where(eq(products.id, id))
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[product DELETE]', err)
    return NextResponse.json({ error: 'خطا در حذف' }, { status: 500 })
  }
}
