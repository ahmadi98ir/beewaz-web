/**
 * GET   /api/admin/inventory — لیست محصولات با موجودی
 * PATCH /api/admin/inventory — به‌روزرسانی موجودی یک محصول
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { products } from '@/lib/db/schema'
import { requirePermission } from '@/lib/rbac'
import { asc, eq, ilike, isNull, and, or, sql } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  const auth = await requirePermission(req, 'inventory:manage')
  if (auth instanceof NextResponse) return auth

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim()
  const lowOnly = searchParams.get('low') === 'true'

  const filters = [isNull(products.deletedAt)]
  if (q) {
    const s = `%${q}%`
    filters.push(or(ilike(products.nameFa, s), ilike(products.sku, s))!)
  }
  if (lowOnly) filters.push(sql`${products.stock} <= 5`)

  const rows = await db
    .select({
      id: products.id,
      nameFa: products.nameFa,
      sku: products.sku,
      stock: products.stock,
      status: products.status,
    })
    .from(products)
    .where(and(...filters))
    .orderBy(asc(products.stock))
    .limit(200)

  return NextResponse.json({ products: rows })
}

export async function PATCH(req: NextRequest) {
  const auth = await requirePermission(req, 'inventory:manage')
  if (auth instanceof NextResponse) return auth

  const body = await req.json() as { id?: string; stock?: number }
  if (!body.id || typeof body.stock !== 'number' || body.stock < 0) {
    return NextResponse.json({ error: 'ورودی نامعتبر' }, { status: 400 })
  }

  const [updated] = await db
    .update(products)
    .set({ stock: body.stock, updatedAt: new Date() })
    .where(eq(products.id, body.id))
    .returning({ id: products.id, stock: products.stock })

  if (!updated) return NextResponse.json({ error: 'محصول یافت نشد' }, { status: 404 })
  return NextResponse.json({ ok: true, product: updated })
}
