/**
 * POST /api/analytics/track
 * ثبت بازدید صفحه — صدا زده می‌شود از middleware یا client
 */

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { pageViews } from '@/lib/db/schema'

export async function POST(req: Request) {
  try {
    const body = await req.json() as {
      path: string
      referrer?: string
      sessionId?: string
    }

    if (!body.path) {
      return NextResponse.json({ ok: false }, { status: 400 })
    }

    const ua = req.headers.get('user-agent') ?? ''
    const device = /mobile|android|iphone|ipad/i.test(ua)
      ? 'mobile'
      : /tablet/i.test(ua)
        ? 'tablet'
        : 'desktop'

    await db.insert(pageViews).values({
      path: body.path.slice(0, 500),
      referrer: body.referrer?.slice(0, 500),
      userAgent: ua.slice(0, 300),
      device,
      sessionId: body.sessionId?.slice(0, 64),
    })

    return NextResponse.json({ ok: true })
  } catch {
    // بازدیدها اگر fail شدن مشکلی نیست — silent fail
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
