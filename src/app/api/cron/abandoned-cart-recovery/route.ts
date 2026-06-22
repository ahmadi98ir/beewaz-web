/**
 * POST /api/cron/abandoned-cart-recovery
 * ارسال پیامک یادآوری برای سبدهای خرید رهاشده — صدا زده می‌شود توسط
 * GitHub Actions scheduled workflow (هر ساعت)، نه از سرور ایران
 * (چون این مسیر صرفاً HTTP عمومی سایت را صدا می‌زند، نه دسترسی مستقیم به سرور).
 */

import { NextResponse } from 'next/server'
import { recoverAbandonedCarts } from '@/lib/analytics/cart-recovery'
import { logger } from '@/lib/logger'

export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 503 })
  }

  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await recoverAbandonedCarts()
    logger.info('[cron] abandoned-cart-recovery finished', result)
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    logger.error('[cron] abandoned-cart-recovery failed', err)
    return NextResponse.json({ ok: false, error: 'internal_error' }, { status: 500 })
  }
}
