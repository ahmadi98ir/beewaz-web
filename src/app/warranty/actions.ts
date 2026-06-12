'use server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { productSerials, warranties } from '@/lib/db/schema'
import { products } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function activateWarranty(serialNumber: string): Promise<
  { ok: true; expiresAt: string; productName: string } | { ok: false; error: string }
> {
  const session = await auth()
  if (!session?.user?.id) return { ok: false, error: 'ابتدا وارد شوید' }

  const serial = serialNumber.trim().toUpperCase()

  const [row] = await db.select({
    id: productSerials.id,
    status: productSerials.status,
    productId: productSerials.productId,
  }).from(productSerials).where(eq(productSerials.serialNumber, serial)).limit(1)

  if (!row) return { ok: false, error: 'شماره سریال یافت نشد' }
  if (row.status !== 'unregistered') return { ok: false, error: 'این سریال قبلاً ثبت شده است' }

  let warrantyDays = 365
  let productName = 'محصول'
  if (row.productId) {
    const [prod] = await db.select({ warrantyDays: products.warrantyDays, nameFa: products.nameFa })
      .from(products).where(eq(products.id, row.productId)).limit(1)
    if (prod) {
      warrantyDays = prod.warrantyDays > 0 ? prod.warrantyDays : 365
      productName = prod.nameFa
    }
  }

  const activatedAt = new Date()
  const expiresAt = new Date(activatedAt.getTime() + warrantyDays * 24 * 60 * 60 * 1000)

  await db.transaction(async (tx) => {
    await tx.update(productSerials).set({ status: 'active' }).where(eq(productSerials.id, row.id))
    await tx.insert(warranties).values({
      userId: session.user!.id,
      serialNumberId: row.id,
      activatedAt,
      expiresAt,
      status: 'active',
    })
  })

  return { ok: true, expiresAt: expiresAt.toISOString(), productName }
}
