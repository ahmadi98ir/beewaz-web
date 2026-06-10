import type { Metadata } from 'next'
import Link             from 'next/link'
import { db }           from '@/lib/db'
import { returnRequests, orders, users, orderItems } from '@/lib/db/schema'
import { eq, desc }     from 'drizzle-orm'
import { ReturnsClient } from './_components/returns-client'
import type { ReturnRow } from './_components/returns-client'

export const metadata: Metadata = { title: 'مرجوعی‌ها' }

export default async function ReturnsPage() {
  let data: ReturnRow[] = []
  let dbError: string | null = null

  try {
    const rows = await db
      .select({
        id:              returnRequests.id,
        orderId:         returnRequests.orderId,
        invoiceNumber:   orders.invoiceNumber,
        status:          returnRequests.status,
        reason:          returnRequests.reason,
        reasonText:      returnRequests.reasonText,
        adminNotes:      returnRequests.adminNotes,
        requestedAt:     returnRequests.requestedAt,
        resolvedAt:      returnRequests.resolvedAt,
        userName:        users.fullName,
        userPhone:       users.phone,
        itemProductName: orderItems.productName,
        itemVariantName: orderItems.variantName,
        itemQuantity:    orderItems.quantity,
      })
      .from(returnRequests)
      .leftJoin(orders,     eq(returnRequests.orderId,     orders.id))
      .leftJoin(users,      eq(returnRequests.userId,      users.id))
      .leftJoin(orderItems, eq(returnRequests.orderItemId, orderItems.id))
      .orderBy(desc(returnRequests.requestedAt))
      .limit(200)

    data = rows.map((r) => ({
      id:              r.id,
      orderId:         r.orderId,
      invoiceNumber:   r.invoiceNumber ?? null,
      status:          r.status,
      reason:          r.reason,
      reasonText:      r.reasonText ?? null,
      adminNotes:      r.adminNotes ?? null,
      requestedAt:     r.requestedAt.toISOString(),
      resolvedAt:      r.resolvedAt?.toISOString() ?? null,
      userName:        r.userName ?? null,
      userPhone:       r.userPhone ?? null,
      itemProductName: r.itemProductName ?? null,
      itemVariantName: r.itemVariantName ?? null,
      itemQuantity:    r.itemQuantity ?? null,
    }))
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[ReturnsPage] DB error:', msg)
    dbError = msg
  }

  const pendingCount = data.filter((r) => r.status === 'pending').length

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

          <div className="flex-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-white font-bold text-lg">مرجوعی‌ها</h1>
              {pendingCount > 0 && (
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-bold">
                  {pendingCount} در انتظار
                </span>
              )}
            </div>
            <p className="text-white/30 text-xs">مدیریت درخواست‌های بازگشت کالا</p>
          </div>

          {/* آمار سریع */}
          <div className="hidden sm:flex items-center gap-4 text-xs">
            <div className="text-center">
              <p className="text-white/70 font-bold text-base">{data.length}</p>
              <p className="text-white/25">کل</p>
            </div>
            <div className="w-px h-8 bg-white/[0.06]" />
            <div className="text-center">
              <p className="text-amber-300 font-bold text-base">{pendingCount}</p>
              <p className="text-white/25">معلق</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── DB Error Banner ─────────────────────────────────────────────── */}
      {dbError && (
        <div className="max-w-5xl mx-auto px-6 pt-6">
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 space-y-1">
            <p className="text-red-400 font-bold text-sm">خطا در بارگذاری داده‌های مرجوعی</p>
            <p className="text-red-300/70 text-xs font-mono break-all">{dbError}</p>
            <p className="text-white/30 text-xs">
              احتمالاً جدول <code className="text-white/50">return_requests</code> در دیتابیس وجود ندارد.
              Migration را اجرا کنید.
            </p>
          </div>
        </div>
      )}

      {/* ─── Content ─────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 py-6">
        <ReturnsClient initialRows={data} />
      </div>
    </div>
  )
}
