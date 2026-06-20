/**
 * POST /api/analytics/track
 * ثبت بازدید صفحه — صدا زده می‌شود از middleware یا client
 */

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { pageViews } from '@/lib/db/schema'
import { UAParser } from 'ua-parser-js'

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
    const parsed = UAParser(ua)
    const deviceType = parsed.device.type
    const device = deviceType === 'mobile' ? 'mobile' : deviceType === 'tablet' ? 'tablet' : 'desktop'
    const browser = parsed.browser.name?.slice(0, 32)
    const os = parsed.os.name?.slice(0, 32)

    await db.insert(pageViews).values({
      path: body.path.slice(0, 500),
      referrer: body.referrer?.slice(0, 500),
      userAgent: ua.slice(0, 300),
      device,
      browser,
      os,
      sessionId: body.sessionId?.slice(0, 64),
    })

    return NextResponse.json({ ok: true })
  } catch {
    // بازدیدها اگر fail شدن مشکلی نیست — silent fail
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
