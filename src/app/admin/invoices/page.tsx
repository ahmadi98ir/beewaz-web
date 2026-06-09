import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@/lib/db'
import { orders, orderItems, users } from '@/lib/db/schema'
import { eq, inArray, desc } from 'drizzle-orm'
import { loadInvoiceSettings, type InvoiceOrder } from './actions'
import { InvoicesClient } from './_components/invoices-client'

export const metadata: Metadata = { title: 'فاکتورها' }

export default async function InvoicesPage() {
  // سفارشات پرداخت‌شده
  const paidOrders = await db
    .select()
    .from(orders)
    .where(inArray(orders.status, ['paid', 'processing', 'shipped', 'delivered']))
    .orderBy(desc(orders.createdAt))
    .limit(200)

  // آیتم‌ها
  const orderIds = paidOrders.map((o) => o.id)
  const allItems = orderIds.length > 0
    ? await db.select().from(orderItems).where(inArray(orderItems.orderId, orderIds))
    : []

  // اطلاعات کاربران
  const userIds = [...new Set(paidOrders.map((o) => o.userId).filter(Boolean))] as string[]
  const allUsers = userIds.length > 0
    ? await db.select({ id: users.id, fullName: users.fullName, phone: users.phone })
        .from(users).where(inArray(users.id, userIds))
    : []
  const userMap = new Map(allUsers.map((u) => [u.id, u]))

  // ساخت ساختار نهایی
  const invoiceOrders: InvoiceOrder[] = paidOrders.map((o) => {
    const user = o.userId ? userMap.get(o.userId) : null
    return {
      id:              o.id,
      invoiceNumber:   o.invoiceNumber,
      createdAt:       o.createdAt.toISOString(),
      paidAt:          o.paidAt?.toISOString() ?? null,
      status:          o.status,
      totalAmount:     o.totalAmount,
      shippingAmount:  o.shippingAmount,
      discountAmount:  o.discountAmount,
      taxAmount:       o.taxAmount,
      paymentMethod:   o.paymentMethod ?? null,
      customerName:    user?.fullName ?? null,
      customerPhone:   user?.phone ?? (o.shippingAddress as { phone?: string })?.phone ?? '—',
      shippingAddress: o.shippingAddress as InvoiceOrder['shippingAddress'],
      billingSnapshot: o.billingSnapshot as InvoiceOrder['billingSnapshot'],
      items: allItems
        .filter((i) => i.orderId === o.id)
        .map((i) => ({
          id:          i.id,
          productName: i.productName,
          variantName: i.variantName ?? null,
          sku:         i.sku ?? null,
          quantity:    i.quantity,
          unitPrice:   i.unitPrice,
          totalPrice:  i.totalPrice,
        })),
    }
  })

  const settings = await loadInvoiceSettings()

  return (
    <div className="min-h-full bg-[#070711]">
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-[#070711]/90 backdrop-blur-md border-b border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link
            href="/admin/dashboard"
            className="w-8 h-8 rounded-lg bg-white/[0.06] hover:bg-white/[0.10] flex items-center justify-center text-white/50 hover:text-white transition-all"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
            </svg>
          </Link>
          <div>
            <h1 className="text-white font-bold text-lg">فاکتورها</h1>
            <p className="text-white/30 text-xs">مدیریت فاکتورهای رسمی و تنظیمات سربرگ</p>
          </div>
        </div>
      </div>

      {/* ─── Content ─────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 py-6">
        {!settings.invoice_company_name && (
          <div className="mb-5 flex items-start gap-3 px-4 py-3.5 rounded-xl bg-amber-500/[0.07] border border-amber-500/20">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5">
              <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            <p className="text-amber-200/70 text-xs leading-5">
              اطلاعات فروشگاه هنوز تکمیل نشده. برای صدور فاکتور رسمی، ابتدا به تب «تنظیمات فاکتور» بروید و اطلاعات شرکت را وارد کنید.
            </p>
          </div>
        )}

        <InvoicesClient orders={invoiceOrders} settings={settings} />
      </div>
    </div>
  )
}
