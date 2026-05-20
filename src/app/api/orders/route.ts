import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { orders, orderItems } from '@/lib/db/schema'
import { products } from '@/lib/db/schema'
import { eq, inArray } from 'drizzle-orm'

const addressSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().regex(/^09\d{9}$/),
  province: z.string().min(2),
  city: z.string().min(2),
  address: z.string().min(5),
  postalCode: z.string().regex(/^\d{10}$/, 'کد پستی ۱۰ رقمی باشد'),
})

const schema = z.object({
  address: addressSchema,
  items: z.array(z.object({
    id: z.string().uuid(),
    quantity: z.number().int().min(1),
  })).min(1),
  notes: z.string().max(500).optional(),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'لطفاً وارد شوید' }, { status: 401 })
  }

  const body = await req.json() as unknown
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message ?? 'اطلاعات نامعتبر' }, { status: 400 })
  }

  const { address, items, notes } = parsed.data
  const productIds = items.map((i) => i.id)

  const dbProducts = await db
    .select({ id: products.id, nameFa: products.nameFa, sku: products.sku, price: products.price, stock: products.stock })
    .from(products)
    .where(inArray(products.id, productIds))

  if (dbProducts.length !== productIds.length) {
    return NextResponse.json({ error: 'یک یا چند محصول یافت نشد' }, { status: 400 })
  }

  const productMap = new Map(dbProducts.map((p) => [p.id, p]))
  let totalAmount = 0
  const orderItemsData: { productId: string; productName: string; sku: string | null; quantity: number; unitPrice: string; totalPrice: string }[] = []

  for (const item of items) {
    const p = productMap.get(item.id)!
    const price = typeof p.price === 'string' ? parseInt(p.price, 10) : (p.price ?? 0)
    const stock = typeof p.stock === 'string' ? parseInt(p.stock, 10) : (p.stock ?? 0)
    if (stock < item.quantity) {
      return NextResponse.json({ error: `موجودی کافی برای "${p.nameFa}" وجود ندارد` }, { status: 400 })
    }
    const lineTotal = price * item.quantity
    totalAmount += lineTotal
    orderItemsData.push({
      productId: p.id,
      productName: p.nameFa ?? '',
      sku: p.sku ?? null,
      quantity: item.quantity,
      unitPrice: String(price),
      totalPrice: String(lineTotal),
    })
  }

  const [order] = await db.insert(orders).values({
    userId: session.user.id,
    status: 'pending',
    totalAmount: String(totalAmount),
    shippingAddress: address,
    paymentMethod: 'online',
    customerNote: notes ?? null,
  }).returning({ id: orders.id })

  if (!order) {
    return NextResponse.json({ error: 'خطا در ثبت سفارش' }, { status: 500 })
  }

  await db.insert(orderItems).values(
    orderItemsData.map((item) => ({ orderId: order.id, ...item }))
  )

  return NextResponse.json({ orderId: order.id, totalAmount })
}
