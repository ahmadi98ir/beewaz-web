import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { orders } from '@/lib/db/schema'
import { eq, desc, isNotNull } from 'drizzle-orm'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id || session.user.id === 'admin-env') {
    return NextResponse.json({ address: null })
  }

  try {
    const lastOrder = await db
      .select({ shippingAddress: orders.shippingAddress })
      .from(orders)
      .where(eq(orders.userId, session.user.id))
      .orderBy(desc(orders.createdAt))
      .limit(1)
      .then((r) => r[0] ?? null)

    return NextResponse.json({ address: lastOrder?.shippingAddress ?? null })
  } catch {
    return NextResponse.json({ address: null })
  }
}
