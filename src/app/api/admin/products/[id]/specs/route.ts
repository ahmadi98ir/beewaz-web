/**
 * GET  /api/admin/products/[id]/specs — دریافت مشخصات فنی
 * PUT  /api/admin/products/[id]/specs — ذخیره/بازنویسی مشخصات فنی
 */

import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { productSpecs } from '@/lib/db/schema'
import { requireAdmin } from '@/lib/admin-auth'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  const { id } = await params
  const specs = await db
    .select()
    .from(productSpecs)
    .where(eq(productSpecs.productId, id))
    .orderBy(productSpecs.sortOrder)

  return NextResponse.json({ specs })
}

export async function PUT(req: NextRequest, { params }: Params) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  const { id } = await params
  const body = await req.json() as { specs: { keyFa: string; valueFa: string }[] }

  if (!Array.isArray(body.specs)) {
    return NextResponse.json({ error: 'specs باید آرایه باشد' }, { status: 400 })
  }

  try {
    // حذف همه specs قبلی و درج مجدد
    await db.delete(productSpecs).where(eq(productSpecs.productId, id))

    if (body.specs.length > 0) {
      await db.insert(productSpecs).values(
        body.specs
          .filter((s) => s.keyFa?.trim() && s.valueFa?.trim())
          .map((s, i) => ({
            productId: id,
            keyFa: s.keyFa.trim(),
            valueFa: s.valueFa.trim(),
            sortOrder: i,
          })),
      )
    }

    const updated = await db
      .select()
      .from(productSpecs)
      .where(eq(productSpecs.productId, id))
      .orderBy(productSpecs.sortOrder)

    return NextResponse.json({ ok: true, specs: updated })
  } catch (err) {
    console.error('[specs PUT]', err)
    return NextResponse.json({ error: 'خطا در ذخیره مشخصات' }, { status: 500 })
  }
}
