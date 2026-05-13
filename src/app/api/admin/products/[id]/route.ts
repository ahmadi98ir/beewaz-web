import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/lib/db'
import { products } from '@/lib/db/schema'
import { requireAdmin } from '@/lib/admin-auth'

const updateSchema = z.object({
  categoryId: z.string().uuid().nullable().optional(),
  sku: z.string().trim().min(1).max(50).optional(),
  nameFa: z.string().trim().min(1).optional(),
  nameEn: z.string().trim().nullable().optional(),
  slug: z.string().trim().min(1).max(160).regex(/^[a-z0-9-]+$/i).optional(),
  descriptionFa: z.string().nullable().optional(),
  price: z.number().int().nonnegative().optional(),
  comparePrice: z.number().int().nonnegative().nullable().optional(),
  stock: z.number().int().nonnegative().optional(),
  status: z.enum(['draft', 'active', 'archived']).optional(),
  isFeatured: z.boolean().optional(),
  metaTitle: z.string().nullable().optional(),
  metaDesc: z.string().nullable().optional(),
})

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const guard = await requireAdmin()
  if (guard.error) return guard.error

  const { id } = await params
  try {
    const product = await db.query.products.findFirst({
      where: eq(products.id, id),
      with: { category: true, images: true, specs: true },
    })
    if (!product) {
      return NextResponse.json({ error: 'محصول یافت نشد' }, { status: 404 })
    }
    return NextResponse.json({ product })
  } catch (err) {
    console.error('[API GET /admin/products/:id]', err)
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  const guard = await requireAdmin()
  if (guard.error) return guard.error

  const { id } = await params
  try {
    const body = await req.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? 'داده‌ها معتبر نیست' },
        { status: 400 },
      )
    }

    const [updated] = await db
      .update(products)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning()

    if (!updated) {
      return NextResponse.json({ error: 'محصول یافت نشد' }, { status: 404 })
    }
    return NextResponse.json({ product: updated })
  } catch (err) {
    const msg = err instanceof Error ? err.message : ''
    if (msg.includes('unique') || msg.includes('duplicate')) {
      return NextResponse.json({ error: 'SKU یا slug تکراری است' }, { status: 409 })
    }
    console.error('[API PUT /admin/products/:id]', err)
    return NextResponse.json({ error: 'خطا در ویرایش' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const guard = await requireAdmin()
  if (guard.error) return guard.error

  const { id } = await params
  try {
    const [deleted] = await db
      .delete(products)
      .where(eq(products.id, id))
      .returning({ id: products.id })

    if (!deleted) {
      return NextResponse.json({ error: 'محصول یافت نشد' }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[API DELETE /admin/products/:id]', err)
    return NextResponse.json({ error: 'خطا در حذف' }, { status: 500 })
  }
}
