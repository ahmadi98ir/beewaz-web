import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { orders } from '@/lib/db/schema'
import { requireAdmin } from '@/lib/admin-auth'

type Params = { params: Promise<{ id: string }> }

const VALID_STATUSES = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'] as const
type OrderStatus = (typeof VALID_STATUSES)[number]

export async function GET(_req: NextRequest, { params }: Params) {
  const guard = await requireAdmin()
  if (guard.error) return guard.error

  const { id } = await params
  try {
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, id),
      with: { items: true, user: true },
    })
    if (!order) return NextResponse.json({ error: 'سفارش یافت نشد' }, { status: 404 })
    return NextResponse.json({ order })
  } catch (err) {
    console.error('[API GET /admin/orders/:id]', err)
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  const guard = await requireAdmin()
  if (guard.error) return guard.error

  const { id } = await params
  try {
    const body = await req.json()
    if (!VALID_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: 'وضعیت نامعتبر' }, { status: 400 })
    }

    const [updated] = await db
      .update(orders)
      .set({ status: body.status as OrderStatus, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning()

    if (!updated) return NextResponse.json({ error: 'سفارش یافت نشد' }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[API PUT /admin/orders/:id]', err)
    return NextResponse.json({ error: 'خطا در بروزرسانی' }, { status: 500 })
  }
}
