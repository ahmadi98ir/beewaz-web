/**
 * GET /api/admin/payment-gateways/test?gateway=zarinpal|idpay
 * تست اتصال به درگاه پرداخت
 */

import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { db } from '@/lib/db'
import { siteSettings } from '@/lib/db/schema'
import { inArray } from 'drizzle-orm'

async function getPaymentValues(keys: string[]): Promise<Record<string, string>> {
  const rows = await db.select().from(siteSettings).where(inArray(siteSettings.key, keys))
  const result: Record<string, string> = {}
  for (const row of rows) result[row.key] = row.value ?? ''
  return result
}

export async function GET(req: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const gateway = searchParams.get('gateway')

  if (gateway === 'zarinpal') {
    const vals = await getPaymentValues(['zarinpal_merchant_id', 'zarinpal_sandbox'])
    const merchantId = vals['zarinpal_merchant_id'] ?? ''

    if (!merchantId) {
      return NextResponse.json({ error: 'Merchant ID تنظیم نشده' }, { status: 400 })
    }

    const baseUrl = vals['zarinpal_sandbox'] === 'true'
      ? 'https://sandbox.zarinpal.com'
      : 'https://api.zarinpal.com'

    try {
      const res = await fetch(`${baseUrl}/pg/v4/payment/request.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchant_id: merchantId,
          amount: 10000,
          callback_url: 'https://beewaz.ir/api/zarinpal/verify',
          description: 'تست اتصال',
          currency: 'IRR',
        }),
      })
      const data = await res.json() as { data?: { code: number }; errors?: { code: number; message: string } }

      // کد 100 = موفق، کد -9 و -2 = merchant_id اشتباه
      const code = data?.data?.code ?? data?.errors?.code
      if (code === 100 || code === 101) {
        return NextResponse.json({ ok: true, message: 'اتصال برقرار است' })
      }
      if (code === -2) {
        return NextResponse.json({ error: 'Merchant ID نامعتبر است' }, { status: 400 })
      }
      // هر پاسخی از سرور یعنی اتصال شبکه برقراره
      return NextResponse.json({ ok: true, message: `پاسخ دریافت شد (کد: ${code})` })
    } catch {
      return NextResponse.json({ error: 'خطا در اتصال به سرور زرین‌پال' }, { status: 502 })
    }
  }

  if (gateway === 'idpay') {
    const vals = await getPaymentValues(['idpay_api_key', 'idpay_sandbox'])
    const apiKey = vals['idpay_api_key'] ?? ''

    if (!apiKey) {
      return NextResponse.json({ error: 'API Key تنظیم نشده' }, { status: 400 })
    }

    try {
      const res = await fetch('https://api.idpay.ir/v1.1/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': apiKey,
          'X-SANDBOX': vals['idpay_sandbox'] === 'true' ? '1' : '0',
        },
        body: JSON.stringify({
          order_id: 'test-' + Date.now(),
          amount: 10000,
          callback: 'https://beewaz.ir/api/idpay/verify',
          desc: 'تست اتصال',
        }),
      })
      const data = await res.json() as { error_code?: number; error_message?: string; id?: string }

      if (data.id) {
        return NextResponse.json({ ok: true, message: 'اتصال برقرار است' })
      }
      if (data.error_code === 11) {
        return NextResponse.json({ error: 'API Key نامعتبر است' }, { status: 400 })
      }
      return NextResponse.json({ ok: true, message: `پاسخ دریافت شد (کد: ${data.error_code})` })
    } catch {
      return NextResponse.json({ error: 'خطا در اتصال به سرور آیدی‌پی' }, { status: 502 })
    }
  }

  return NextResponse.json({ error: 'درگاه نامعتبر' }, { status: 400 })
}
