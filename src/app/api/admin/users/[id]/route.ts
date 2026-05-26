/**
 * GET   /api/admin/users/[id]  — پروفایل کامل مشتری
 * PATCH /api/admin/users/[id]  — ویرایش اطلاعات
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users, orders, orderItems, customerNotes } from '@/lib/db/schema'
import { requireAdmin } from '@/lib/admin-auth'
import { eq, desc, sql } from 'drizzle-orm'

type Params = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1)
  if (!user) return NextResponse.json({ error: 'مشتری یافت نشد' }, { status: 404 })

  const [userOrders, stats, notes] = await Promise.all([
    db
      .select({
        id:            orders.id,
        status:        orders.status,
        totalAmount:   orders.totalAmount,
        trackingCode:  orders.trackingCode,
        shippingAddress: orders.shippingAddress,
        createdAt:     orders.createdAt,
      })
      .from(orders)
      .where(eq(orders.userId, id))
      .orderBy(desc(orders.createdAt))
      .limit(20),

    db
      .select({
        totalOrders:  sql<number>`count(*)::int`,
        totalSpent:   sql<number>`coalesce(sum(case when ${orders.status} in ('paid','delivered') then ${orders.totalAmount}::numeric else 0 end), 0)::bigint`,
      })
      .from(orders)
      .where(eq(orders.userId, id)),

    db
      .select()
      .from(customerNotes)
      .where(eq(customerNotes.userId, id))
      .orderBy(desc(customerNotes.createdAt)),
  ])

  const s = stats[0]
  return NextResponse.json({
    user,
    orders: userOrders,
    stats: {
      totalOrders: s?.totalOrders ?? 0,
      totalSpent:  Number(s?.totalSpent ?? 0),
    },
    notes,
  })
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json() as { fullName?: string; email?: string; role?: string }

  const [updated] = await db
    .update(users)
    .set({
      ...(body.fullName !== undefined && { fullName: body.fullName }),
      ...(body.email    !== undefined && { email:    body.email }),
      ...(body.role     !== undefined && { role:     body.role as 'customer' | 'admin' | 'sales_agent' }),
      updatedAt: new Date(),
    })
    .where(eq(users.id, id))
    .returning()

  return NextResponse.json({ user: updated })
}
