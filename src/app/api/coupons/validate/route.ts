import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { coupons, couponUsages } from '@/lib/db/schema'
import { eq, and, count } from 'drizzle-orm'

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(userId)
  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + 60_000 })
    return true
  }
  if (entry.count >= 10) return false
  entry.count++
  return true
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'لطفاً وارد شوید' }, { status: 401 })
  }

  if (!checkRateLimit(session.user.id)) {
    return NextResponse.json({ error: 'تعداد درخواست‌ها زیاد است. لطفاً کمی صبر کنید' }, { status: 429 })
  }

  const body = await req.json() as { code?: string; orderAmount?: number }
  const code = body.code?.trim().toUpperCase()
  const orderAmount = body.orderAmount ?? 0

  if (!code) {
    return NextResponse.json({ error: 'کد کوپن وارد کنید' }, { status: 400 })
  }

  // پیدا کردن کوپن
  const [coupon] = await db.select().from(coupons)
    .where(and(eq(coupons.code, code), eq(coupons.active, true)))
    .limit(1)

  if (!coupon) {
    return NextResponse.json({ error: 'کد تخفیف معتبر نیست' }, { status: 404 })
  }

  // بررسی تاریخ انقضا
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    return NextResponse.json({ error: 'کد تخفیف منقضی شده است' }, { status: 400 })
  }

  // بررسی حداکثر استفاده کل
  if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
    return NextResponse.json({ error: 'ظرفیت استفاده از این کد تخفیف تمام شده' }, { status: 400 })
  }

  // بررسی حداقل مبلغ سفارش
  if (coupon.minOrderAmount && orderAmount < Number(coupon.minOrderAmount)) {
    return NextResponse.json({
      error: `حداقل مبلغ سفارش برای این کوپن ${Math.floor(Number(coupon.minOrderAmount) / 10).toLocaleString('fa-IR')} تومان است`,
    }, { status: 400 })
  }

  // بررسی محدودیت هر کاربر
  if (coupon.perUserLimit && coupon.perUserLimit > 0) {
    const usageRows = await db
      .select({ count: count() })
      .from(couponUsages)
      .where(and(eq(couponUsages.couponId, coupon.id), eq(couponUsages.userId, session.user.id)))
    const userUsageCount = usageRows[0]?.count ?? 0

    if (userUsageCount >= coupon.perUserLimit) {
      return NextResponse.json({ error: 'قبلاً از این کد تخفیف استفاده کرده‌اید' }, { status: 400 })
    }
  }

  // محاسبه مبلغ تخفیف
  let discountAmount = 0
  if (coupon.type === 'percentage') {
    discountAmount = Math.floor(orderAmount * Number(coupon.value) / 100)
    if (coupon.maxDiscountAmount) {
      discountAmount = Math.min(discountAmount, Number(coupon.maxDiscountAmount))
    }
  } else {
    discountAmount = Math.min(Number(coupon.value), orderAmount)
  }

  return NextResponse.json({
    valid: true,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      value: Number(coupon.value),
      discountAmount,
    },
  })
}
