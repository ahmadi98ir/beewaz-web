import { db } from '@/lib/db'
import { smsLogs } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'لاگ پیامک‌ها' }

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  sent:      { label: 'ارسال شد',   cls: 'bg-green-50 text-green-700 border-green-200' },
  delivered: { label: 'تحویل شد',   cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  failed:    { label: 'خطا',        cls: 'bg-red-50 text-red-600 border-red-200' },
  queued:    { label: 'در صف',      cls: 'bg-amber-50 text-amber-700 border-amber-200' },
}

const TRIGGER_MAP: Record<string, string> = {
  otp:                 'OTP',
  order_status_change: 'تغییر وضعیت',
  payment_success:     'پرداخت',
  shipment_tracking:   'ارسال',
  low_stock_alert:     'کمبود موجودی',
  manual:              'دستی',
  invoice_request:     'فاکتور',
}

export default async function SmsLogsPage() {
  let logs: (typeof smsLogs.$inferSelect)[] = []
  let dbError: string | null = null

  try {
    logs = await db
      .select()
      .from(smsLogs)
      .orderBy(desc(smsLogs.createdAt))
      .limit(100)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[SmsLogsPage] DB error:', msg)
    dbError = msg
  }

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <h1 className="text-xl font-bold text-surface-900">لاگ پیامک‌ها</h1>

      {dbError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 space-y-1">
          <p className="text-red-600 font-bold text-sm">خطا در بارگذاری لاگ پیامک‌ها</p>
          <p className="text-red-500/80 text-xs font-mono break-all">{dbError}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-100 bg-surface-50 text-surface-500 text-right">
                <th className="px-4 py-3 font-medium">تاریخ</th>
                <th className="px-4 py-3 font-medium">شماره گیرنده</th>
                <th className="px-4 py-3 font-medium">متن پیام</th>
                <th className="px-4 py-3 font-medium">وضعیت</th>
                <th className="px-4 py-3 font-medium">رویداد</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-surface-400">
                    هیچ لاگی یافت نشد
                  </td>
                </tr>
              )}
              {logs.map((log) => {
                const statusCfg = STATUS_MAP[log.status] ?? { label: log.status, cls: 'bg-surface-50 text-surface-500 border-surface-200' }
                const triggerLabel = TRIGGER_MAP[log.trigger] ?? log.trigger
                const createdAt = new Date(log.createdAt)
                const dateStr = createdAt.toLocaleDateString('fa-IR', {
                  year: 'numeric', month: '2-digit', day: '2-digit',
                })
                const timeStr = createdAt.toLocaleTimeString('fa-IR', {
                  hour: '2-digit', minute: '2-digit',
                })
                const truncatedMsg = log.message.length > 60
                  ? log.message.slice(0, 60) + '…'
                  : log.message

                return (
                  <tr key={log.id} className="hover:bg-surface-50 transition-colors">
                    <td className="px-4 py-3 text-surface-600 whitespace-nowrap">
                      <div>{dateStr}</div>
                      <div className="text-xs text-surface-400">{timeStr}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-surface-700 whitespace-nowrap" dir="ltr">
                      {log.phone}
                    </td>
                    <td className="px-4 py-3 text-surface-700 max-w-xs">
                      {truncatedMsg}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${statusCfg.cls}`}>
                        {statusCfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-surface-600">
                      {triggerLabel}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
