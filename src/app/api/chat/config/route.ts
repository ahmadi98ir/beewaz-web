/**
 * GET /api/chat/config
 * تنظیمات عمومی چت‌بات از CMS — بدون نیاز به احراز هویت
 */

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { pageContent } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

const DEFAULTS = {
  bot_name:       'پشتیبان بیواز',
  bot_status:     'آنلاین',
  welcome_msg:    'سلام! 👋 من دستیار هوشمند بیواز هستم. چطور می‌تونم کمکتون کنم؟',
  quick_replies:  JSON.stringify(['قیمت محصولات', 'مشاوره خرید', 'پشتیبانی فنی', 'ارسال سفارش']),
  footer_text:    'پاسخگوی ۲۴ ساعته | بیواز',
}

export async function GET() {
  try {
    const rows = await db
      .select({ key: pageContent.key, valueFa: pageContent.valueFa })
      .from(pageContent)
      .where(eq(pageContent.page, 'chatbot'))

    const config: Record<string, string> = { ...DEFAULTS }
    for (const row of rows) {
      if (row.valueFa) config[row.key] = row.valueFa
    }

    return NextResponse.json(config, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    })
  } catch {
    return NextResponse.json(DEFAULTS)
  }
}
