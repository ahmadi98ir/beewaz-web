import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { orders, orderItems, users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { loadInvoiceSettings } from '@/app/admin/invoices/actions'
import { PrintableInvoice } from '@/app/admin/invoices/_components/printable-invoice'
import { PrintButton } from './_print-button'
import type { InvoiceOrder } from '@/app/admin/invoices/types'

const PAID_STATUSES = ['paid', 'processing', 'shipped', 'delivered'] as const

export default async function CustomerInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const [orderRow] = await db.select().from(orders).where(eq(orders.id, id))
  if (!orderRow) notFound()
  if (orderRow.userId !== session.user.id) notFound()

  if (!(PAID_STATUSES as readonly string[]).includes(orderRow.status)) {
    return (
      <div className="min-h-screen bg-surface-50 flex flex-col items-center justify-center gap-4 p-8" dir="rtl">
        <p className="text-surface-500 text-center">برای این سفارش هنوز فاکتور رسمی قابل صدور نیست.</p>
        <Link href={`/orders/${id}`} className="btn btn-outline text-sm">بازگشت به سفارش</Link>
      </div>
    )
  }

  const allItems = await db.select().from(orderItems).where(eq(orderItems.orderId, id))

  let customerName: string | null = null
  let customerPhone = '—'
  if (orderRow.userId) {
    const [u] = await db.select({ fullName: users.fullName, phone: users.phone })
      .from(users).where(eq(users.id, orderRow.userId))
    if (u) { customerName = u.fullName ?? null; customerPhone = u.phone ?? '—' }
  }

  const invoiceOrder: InvoiceOrder = {
    id: orderRow.id,
    invoiceNumber: orderRow.invoiceNumber,
    createdAt: orderRow.createdAt.toISOString(),
    paidAt: orderRow.paidAt?.toISOString() ?? null,
    status: orderRow.status,
    totalAmount: orderRow.totalAmount,
    shippingAmount: orderRow.shippingAmount,
    discountAmount: orderRow.discountAmount,
    taxAmount: orderRow.taxAmount,
    paymentMethod: orderRow.paymentMethod ?? null,
    customerName,
    customerPhone,
    shippingAddress: orderRow.shippingAddress as InvoiceOrder['shippingAddress'],
    billingSnapshot: orderRow.billingSnapshot as InvoiceOrder['billingSnapshot'],
    items: allItems.map((i) => ({
      id: i.id,
      productName: i.productName,
      variantName: i.variantName ?? null,
      sku: i.sku ?? null,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      totalPrice: i.totalPrice,
    })),
  }

  const settings = await loadInvoiceSettings()

  return (
    <div className="min-h-screen bg-surface-50 py-8 px-4" dir="rtl">
      <div className="max-w-3xl mx-auto mb-4 flex gap-3 print:hidden">
        <Link
          href={`/orders/${id}`}
          className="btn btn-outline text-sm py-2.5 flex-1 flex items-center justify-center gap-2"
        >
          ← بازگشت به سفارش
        </Link>
        <PrintButton />
      </div>

      <PrintableInvoice order={invoiceOrder} settings={settings} />
    </div>
  )
}
