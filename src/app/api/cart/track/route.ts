/**
 * POST /api/cart/track
 * ثبت فعالیت سبد خرید کاربر لاگین‌شده برای یادآوری سبد رهاشده (cart abandonment)
 */

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { trackCartActivity } from '@/lib/analytics/cart-recovery'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(req: Request) {
  const session = await auth()
  // فقط کاربران لاگین‌شده قابل پیامک‌دهی هستند — برای مهمان‌ها نیازی به ردیابی نیست
  if (!session?.user?.id || session.user.id === 'admin-env') {
    return NextResponse.json({ ok: true })
  }

  if (!checkRateLimit(`cart-track:${session.user.id}`, 20, 60 * 1000)) {
    return NextResponse.json({ ok: false }, { status: 429 })
  }

  try {
    const body = await req.json() as {
      items?: { id: string; nameFa: string; quantity: number; price: number }[]
      sessionId?: string
    }

    const items = (body.items ?? []).map((i) => ({
      productId: i.id,
      productName: i.nameFa,
      quantity: i.quantity,
      unitPrice: i.price,
    }))

    await trackCartActivity({ userId: session.user.id, sessionId: body.sessionId, items })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
