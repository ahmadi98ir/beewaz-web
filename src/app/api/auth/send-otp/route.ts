import { NextResponse } from 'next/server'
import { z } from 'zod'
import { and, eq, gte } from 'drizzle-orm'
import { db } from '@/lib/db'
import { phoneOtps } from '@/lib/db/schema'
import { sendVerifySms, SMS_TEMPLATES } from '@/lib/sms'

const schema = z.object({
  phone: z.string().regex(/^09\d{9}$/, 'شماره موبایل معتبر نیست'),
})

export async function POST(req: Request) {
  try {
    const body = await req.json() as unknown
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? 'شماره موبایل معتبر نیست' },
        { status: 400 },
      )
    }

    const { phone } = parsed.data

    // نرخ‌محدودی: حداکثر یک OTP هر ۲ دقیقه
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000)
    const recent = await db
      .select({ id: phoneOtps.id })
      .from(phoneOtps)
      .where(and(eq(phoneOtps.phone, phone), gte(phoneOtps.createdAt, twoMinutesAgo)))
      .limit(1)

    if (recent.length > 0) {
      return NextResponse.json(
        { error: 'لطفاً ۲ دقیقه صبر کنید و دوباره امتحان کنید' },
        { status: 429 },
      )
    }

    // نرخ‌محدودی روزانه: حداکثر ۱۰ OTP در ۲۴ ساعت
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const dailyCount = await db
      .select({ id: phoneOtps.id })
      .from(phoneOtps)
      .where(and(eq(phoneOtps.phone, phone), gte(phoneOtps.createdAt, oneDayAgo)))

    if (dailyCount.length >= 10) {
      return NextResponse.json(
        { error: 'تعداد درخواست‌های شما برای امروز به حد مجاز رسیده است' },
        { status: 429 },
      )
    }

    const code = String(Math.floor(100000 + Math.random() * 900000))
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

    await db.insert(phoneOtps).values({ phone, code, expiresAt })

    const sent = await sendVerifySms(phone, SMS_TEMPLATES.OTP, { OTP: code }, { trigger: 'otp' })
    if (!sent) {
      return NextResponse.json({ error: 'خطا در ارسال پیامک. لطفاً دوباره تلاش کنید' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[send-otp]', err)
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}
