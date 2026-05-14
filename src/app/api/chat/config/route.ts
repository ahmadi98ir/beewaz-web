/**
 * GET /api/chat/config — تنظیمات عمومی چت‌بات (بدون احراز هویت)
 * مقادیر پیش‌فرض در صورت نبود داده در DB برگردانده می‌شوند
 */

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { pageContent } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

const DEFAULTS = {
  bot_name:       'دستیار هوشمند بیواز',
  bot_status:     'آنلاین — پاسخگو ۲۴ ساعته',
  welcome_msg:    'سلام! 👋 چطور می‌تونم کمکتون کنم؟\n\nبرای شروع مشاوره رایگان، روی دکمه زیر بزنید.',
  quick_replies:  'شروع مشاوره رایگان',
  footer_text:    'بیواز — مشاوره رایگان ۲۴/۷',
  system_prompt:  'شما دستیار هوشمند بیواز هستید. به فارسی پاسخ دهید.',
}

export async function GET() {
  try {
    const rows = await db
      .select({ key: pageContent.key, valueFa: pageContent.valueFa })
      .from(pageContent)
      .where(eq(pageContent.page, 'chatbot'))

    const config: Record<string, string> = { ...DEFAULTS }
    for (const row of rows) {
      if (row.valueFa !== null) config[row.key] = row.valueFa
    }

    // quick_replies را به آرایه تبدیل می‌کنیم
    const quickReplies = (config.quick_replies ?? DEFAULTS.quick_replies)
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)

    return NextResponse.json({ ...config, quickReplies })
  } catch {
    // در صورت خطای DB، مقادیر پیش‌فرض برمی‌گردد
    return NextResponse.json({
      ...DEFAULTS,
      quickReplies: ['شروع مشاوره رایگان'],
    })
  }
}
