/**
 * GET /api/orders/[id] — جزئیات سفارش برای مشتری
 * فقط برای صاحب سفارش
 */
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { orders, orderItems } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

type Params = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'لطفاً وارد شوید' }, { status: 401 })
  }

  const { id } = await params

  const [order] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, id), eq(orders.userId, session.user.id)))
    .limit(1)

  if (!order) {
    return NextResponse.json({ error: 'سفارش یافت نشد' }, { status: 404 })
  }

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, id))

  return NextResponse.json({ order, items })
}
