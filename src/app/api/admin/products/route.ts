import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { products } from '@/lib/db/schema'
import { requireAdmin } from '@/lib/admin-auth'

const productSchema = z.object({
  categoryId: z.string().uuid().nullable().optional(),
  sku: z.string().trim().min(1).max(50),
  nameFa: z.string().trim().min(1),
  nameEn: z.string().trim().optional().nullable(),
  slug: z.string().trim().min(1).max(160).regex(/^[a-z0-9-]+$/i, 'slug فقط شامل حروف، اعداد و خط تیره'),
  descriptionFa: z.string().optional().nullable(),
  price: z.number().int().nonnegative(),
  comparePrice: z.number().int().nonnegative().nullable().optional(),
  stock: z.number().int().nonnegative().default(0),
  status: z.enum(['draft', 'active', 'archived']).default('draft'),
  isFeatured: z.boolean().default(false),
  metaTitle: z.string().optional().nullable(),
  metaDesc: z.string().optional().nullable(),
})

export async function GET() {
  const guard = await requireAdmin()
  if (guard.error) return guard.error

  try {
    const list = await db.query.products.findMany({
      with: { category: true },
      orderBy: (p, { desc }) => [desc(p.createdAt)],
    })
    return NextResponse.json({ products: list })
  } catch (err) {
    console.error('[API GET /admin/products]', err)
    return NextResponse.json({ error: 'خطا در بارگیری محصولات' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const guard = await requireAdmin()
  if (guard.error) return guard.error

  try {
    const body = await req.json()
    const parsed = productSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? 'داده‌ها معتبر نیست' },
        { status: 400 },
      )
    }

    const [created] = await db.insert(products).values(parsed.data).returning()
    return NextResponse.json({ product: created }, { status: 201 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : ''
    if (msg.includes('unique') || msg.includes('duplicate')) {
      return NextResponse.json(
        { error: 'SKU یا slug تکراری است' },
        { status: 409 },
      )
    }
    console.error('[API POST /admin/products]', err)
    return NextResponse.json({ error: 'خطا در ایجاد محصول' }, { status: 500 })
  }
}
