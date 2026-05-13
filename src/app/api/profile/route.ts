import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { users, orders, orderItems } from '@/lib/db/schema'
import { eq, desc, sql } from 'drizzle-orm'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = session.user.id

  try {
    const [user, userOrders] = await Promise.all([
      db
        .select({
          id: users.id,
          fullName: users.fullName,
          phone: users.phone,
          email: users.email,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1)
        .then((r) => r[0] ?? null),

      db
        .select({
          id: orders.id,
          status: orders.status,
          totalAmount: orders.totalAmount,
          createdAt: orders.createdAt,
          itemCount: sql<number>`(select count(*)::int from order_items where order_id = ${orders.id})`,
        })
        .from(orders)
        .where(eq(orders.userId, userId))
        .orderBy(desc(orders.createdAt))
        .limit(20),
    ])

    return NextResponse.json({ user, orders: userOrders })
  } catch (err) {
    console.error('[profile GET]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json() as { fullName?: string; email?: string }
    const update: { fullName?: string; email?: string | null } = {}
    if (typeof body.fullName === 'string') update.fullName = body.fullName.trim() || undefined
    if (typeof body.email === 'string') update.email = body.email.trim() || null

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ ok: true })
    }

    await db
      .update(users)
      .set({ ...update, updatedAt: new Date() })
      .where(eq(users.id, session.user.id))

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[profile PATCH]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
