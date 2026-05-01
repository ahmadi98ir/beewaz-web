import { NextRequest, NextResponse } from 'next/server'
import type { LeadRequest, LeadResponse } from '@/types/chat'

// ── CRM Integration ──────────────────────────────────────────────────────────
// این فایل نقطه اتصال به سیستم CRM است.
// در حال حاضر یک mock CRM فرضی است.
// برای اتصال به CRM واقعی، کافی است تابع `saveToCRM` را تغییر دهید.

async function saveToCRM(lead: LeadRequest): Promise<string> {
  // ── گزینه ۱: ذخیره در PostgreSQL (پس از راه‌اندازی DB) ───────────────
  // const { db } = await import('@/lib/db')
  // const { leads } = await import('@/lib/db/schema')
  // const [saved] = await db.insert(leads).values({
  //   phone: lead.phone,
  //   place: lead.place,
  //   aiSummary: `محیط: ${lead.place}, متراژ: ${lead.size}, بودجه: ${lead.budget}`,
  //   source: lead.source,
  // }).returning({ id: leads.id })
  // return saved.id

  // ── گزینه ۲: ارسال به Webhook CRM خارجی ─────────────────────────────
  // await fetch(process.env.CRM_WEBHOOK_URL!, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.CRM_API_KEY}` },
  //   body: JSON.stringify({ phone: lead.phone, tags: ['chatbot', lead.place] }),
  // })

  // ── گزینه ۳: ارسال اعلان به ربات تلگرام تیم فروش ────────────────────
  // const text = `🔔 لید جدید!\n📱 ${lead.phone}\n🏠 ${lead.place}\n📐 ${lead.size}\n💰 ${lead.budget}`
  // await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ chat_id: process.env.TELEGRAM_SALES_CHAT_ID, text, parse_mode: 'HTML' }),
  // })

  // ── Mock: فعلاً فقط لاگ ──────────────────────────────────────────────
  const leadId = `lead_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
  console.log('[CRM] New lead saved:', { leadId, ...lead, timestamp: new Date().toISOString() })

  return leadId
}

// ── Request Handler ──────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as LeadRequest

    // اعتبارسنجی شماره
    const phoneRegex = /^(\+98|0)?9\d{9}$/
    if (!phoneRegex.test(body.phone?.trim() ?? '')) {
      return NextResponse.json<LeadResponse>(
        { success: false, message: 'شماره موبایل معتبر نیست' },
        { status: 400 },
      )
    }

    const leadId = await saveToCRM({
      phone: body.phone.trim(),
      place: body.place,
      size: body.size,
      budget: body.budget,
      source: 'chatbot',
      visitorToken: body.visitorToken,
    })

    return NextResponse.json<LeadResponse>({
      success: true,
      leadId,
      message: 'لید با موفقیت ثبت شد',
    })
  } catch (err) {
    console.error('[API /leads] Error:', err)
    return NextResponse.json<LeadResponse>(
      { success: false, message: 'خطای سرور' },
      { status: 500 },
    )
  }
}
