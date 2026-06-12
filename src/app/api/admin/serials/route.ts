import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { productSerials, products } from '@/lib/db/schema'
import { requireAdmin } from '@/lib/admin-auth'
import { eq, desc } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  const adminCheck = await requireAdmin(req)
  if (!adminCheck.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rows = await db.select({
    id: productSerials.id,
    serialNumber: productSerials.serialNumber,
    status: productSerials.status,
    generatedAt: productSerials.generatedAt,
    productName: products.nameFa,
  })
  .from(productSerials)
  .leftJoin(products, eq(productSerials.productId, products.id))
  .orderBy(desc(productSerials.generatedAt))
  .limit(500)

  return NextResponse.json({ serials: rows })
}

export async function POST(req: NextRequest) {
  const adminCheck = await requireAdmin(req)
  if (!adminCheck.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as { serials: string[]; productId?: string }
  if (!body.serials?.length) return NextResponse.json({ error: 'سریالی ارسال نشده' }, { status: 400 })

  const values = body.serials
    .map(s => s.trim().toUpperCase())
    .filter(Boolean)
    .map(serialNumber => ({ serialNumber, productId: body.productId ?? null }))

  await db.insert(productSerials).values(values).onConflictDoNothing()

  return NextResponse.json({ ok: true, count: values.length })
}
