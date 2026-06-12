import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { returnRequests } from '@/lib/db/schema/returns'
import { orderItems } from '@/lib/db/schema/orders'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const rows = await db
    .select({
      id:          returnRequests.id,
      reason:      returnRequests.reason,
      reasonText:  returnRequests.reasonText,
      status:      returnRequests.status,
      adminNotes:  returnRequests.adminNotes,
      requestedAt: returnRequests.requestedAt,
      resolvedAt:  returnRequests.resolvedAt,
      productName: orderItems.productName,
    })
    .from(returnRequests)
    .leftJoin(orderItems, eq(returnRequests.orderItemId, orderItems.id))
    .where(eq(returnRequests.orderId, id))
    .orderBy(returnRequests.requestedAt)

  return NextResponse.json({ returns: rows })
}
