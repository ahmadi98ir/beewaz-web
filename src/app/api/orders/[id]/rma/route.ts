import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { returnRequests, orders } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json() as { reason: string; reasonText?: string; type?: 'rma' | 'warranty_service' }

  const [order] = await db.select({ id: orders.id, userId: orders.userId })
    .from(orders).where(and(eq(orders.id, id), eq(orders.userId, session.user.id))).limit(1)
  if (!order) return NextResponse.json({ error: 'سفارش یافت نشد' }, { status: 404 })

  await db.insert(returnRequests).values({
    orderId: id,
    userId: session.user.id,
    reason: body.reason as 'defective' | 'wrong_item' | 'not_as_described' | 'changed_mind' | 'other',
    reasonText: body.reasonText,
    status: 'pending',
  })

  return NextResponse.json({ ok: true })
}
