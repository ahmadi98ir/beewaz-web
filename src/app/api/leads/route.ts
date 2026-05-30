import { NextRequest, NextResponse } from 'next/server'
import type { LeadRequest, LeadResponse } from '@/types/chat'

// ── CRM Integration ──────────────────────────────────────────────────────────
// این فایل نقطه اتصال به سیستم CRM است.
// در حال حاضر یک mock CRM فرضی است.
// برای اتصال به CRM واقعی، کافی است تابع `saveToCRM` را تغییر دهید.

async function saveToCRM(lead: LeadRequest): Promise<string> {
  const { db } = await import('@/lib/db')
  const { leads } = await import('@/lib/db/schema')
  const [saved] = await db.insert(leads).values({
    phone: lead.phone,
    inquiryType: lead.place ?? 'chatbot',
    aiSummary: [
      lead.place  ? `محیط: ${lead.place}`   : null,
      lead.size   ? `متراژ: ${lead.size}`   : null,
      lead.budget ? `بودجه: ${lead.budget}` : null,
    ].filter(Boolean).join('، ') || null,
    status: 'new',
  }).returning({ id: leads.id })

  return saved!.id
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
