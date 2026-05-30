import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { coupons } from '@/lib/db/schema'
import { requireAdmin } from '@/lib/admin-auth'
import { eq } from 'drizzle-orm'

type Params = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const [c] = await db.select().from(coupons).where(eq(coupons.id, id)).limit(1)
  if (!c) return NextResponse.json({ error: 'کوپن یافت نشد' }, { status: 404 })
  return NextResponse.json({ coupon: c })
}

export async function PUT(req: NextRequest, { params }: Params) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await req.json() as Record<string, unknown>

  const update: Partial<typeof coupons.$inferInsert> = {}
  if (body.code)            update.code             = String(body.code).trim().toUpperCase()
  if (body.type)            update.type             = body.type as 'percentage' | 'fixed'
  if (body.value != null)   update.value            = String(body.value)
  if ('minOrderAmount'    in body) update.minOrderAmount    = body.minOrderAmount    ? String(body.minOrderAmount)    : null
  if ('maxDiscountAmount' in body) update.maxDiscountAmount = body.maxDiscountAmount ? String(body.maxDiscountAmount) : null
  if ('usageLimit'        in body) update.usageLimit        = body.usageLimit        ? Number(body.usageLimit)        : null
  if ('perUserLimit'      in body) update.perUserLimit      = body.perUserLimit      ? Number(body.perUserLimit)      : 1
  if ('expiresAt'         in body) update.expiresAt         = body.expiresAt         ? new Date(body.expiresAt as string) : null
  if ('active'            in body) update.active            = Boolean(body.active)
  update.updatedAt = new Date()

  const [updated] = await db.update(coupons).set(update).where(eq(coupons.id, id)).returning()
  return NextResponse.json({ coupon: updated })
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  await db.delete(coupons).where(eq(coupons.id, id))
  return NextResponse.json({ ok: true })
}
