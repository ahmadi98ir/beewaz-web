import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { productSerials, warranties, products } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  const serial = req.nextUrl.searchParams.get('serial')?.trim().toUpperCase()
  if (!serial) return NextResponse.json({ error: 'شماره سریال الزامی است' }, { status: 400 })

  const [row] = await db.select({
    id: productSerials.id,
    status: productSerials.status,
    productId: productSerials.productId,
  }).from(productSerials).where(eq(productSerials.serialNumber, serial)).limit(1)

  if (!row) return NextResponse.json({ found: false, message: 'شماره سریال در سیستم یافت نشد' })

  let productName: string | null = null
  if (row.productId) {
    const [prod] = await db.select({ nameFa: products.nameFa }).from(products).where(eq(products.id, row.productId)).limit(1)
    if (prod) productName = prod.nameFa
  }

  if (row.status === 'unregistered') {
    return NextResponse.json({ found: true, genuine: true, registered: false, productName, message: 'کالا اصل است اما گارانتی ثبت نشده' })
  }

  const [warranty] = await db.select({
    activatedAt: warranties.activatedAt,
    expiresAt: warranties.expiresAt,
    status: warranties.status,
  }).from(warranties).where(eq(warranties.serialNumberId, row.id)).limit(1)

  if (!warranty) return NextResponse.json({ found: true, genuine: true, registered: false, productName })

  const now = new Date()
  const expired = warranty.expiresAt < now

  return NextResponse.json({
    found: true,
    genuine: true,
    registered: true,
    productName,
    warrantyStatus: expired ? 'expired' : warranty.status,
    activatedAt: warranty.activatedAt.toISOString(),
    expiresAt: warranty.expiresAt.toISOString(),
    isExpired: expired,
  })
}
