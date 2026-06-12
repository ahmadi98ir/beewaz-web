import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { warranties, productSerials, products } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rows = await db.select({
    id: warranties.id,
    activatedAt: warranties.activatedAt,
    expiresAt: warranties.expiresAt,
    status: warranties.status,
    serialNumber: productSerials.serialNumber,
    productName: products.nameFa,
  })
  .from(warranties)
  .leftJoin(productSerials, eq(warranties.serialNumberId, productSerials.id))
  .leftJoin(products, eq(productSerials.productId, products.id))
  .where(eq(warranties.userId, session.user.id))
  .orderBy(warranties.activatedAt)

  return NextResponse.json({ warranties: rows })
}
