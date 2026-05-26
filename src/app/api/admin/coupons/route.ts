import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { coupons } from '@/lib/db/schema'
import { requireAdmin } from '@/lib/admin-auth'
import { desc, eq } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const all = await db.select().from(coupons).orderBy(desc(coupons.createdAt))
  return NextResponse.json({ coupons: all })
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as Record<string, unknown>

  const code = String(body.code ?? '').trim().toUpperCase()
  if (!code) return NextResponse.json({ error: 'کد کوپن الزامی است' }, { status: 400 })

  try {
    const [coupon] = await db.insert(coupons).values({
      code,
      type: body.type as 'percentage' | 'fixed',
      value: String(body.value ?? 0),
      minOrderAmount: body.minOrderAmount ? String(body.minOrderAmount) : null,
      maxDiscountAmount: body.maxDiscountAmount ? String(body.maxDiscountAmount) : null,
      usageLimit: body.usageLimit ? Number(body.usageLimit) : null,
      perUserLimit: body.perUserLimit ? Number(body.perUserLimit) : 1,
      expiresAt: body.expiresAt ? new Date(body.expiresAt as string) : null,
      active: body.active !== false,
    }).returning()

    return NextResponse.json({ coupon }, { status: 201 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : ''
    if (msg.includes('unique')) return NextResponse.json({ error: 'این کد کوپن قبلاً استفاده شده' }, { status: 409 })
    return NextResponse.json({ error: 'خطا در ذخیره کوپن' }, { status: 500 })
  }
}
