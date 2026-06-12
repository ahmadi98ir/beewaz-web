import { NextRequest, NextResponse } from 'next/server'
import { chat } from '@/lib/gemini'
import { db } from '@/lib/db'
import { products, categories } from '@/lib/db/schema'
import { chatSessions, chatMessages } from '@/lib/db/schema/chat'
import { eq, and } from 'drizzle-orm'

// ── Product context for system prompt ─────────────────────────────────────────

async function getProductContext(): Promise<string> {
  try {
    const rows = await db
      .select({
        name:     products.nameFa,
        price:    products.price,
        stock:    products.stock,
        category: categories.nameFa,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(and(eq(products.status, 'active')))
      .orderBy(products.isFeatured)
      .limit(10)

    if (rows.length === 0) return ''

    const lines = rows.map((p) => {
      const price = Math.floor(p.price / 10).toLocaleString('fa-IR')
      return `- ${p.name} | دسته: ${p.category ?? 'عمومی'} | قیمت: ${price} تومان${p.stock === 0 ? ' (ناموجود)' : ''}`
    })
    return 'محصولات موجود در فروشگاه:\n' + lines.join('\n')
  } catch {
    return ''
  }
}

// ── System prompt ─────────────────────────────────────────────────────────────

function buildSystemPrompt(productContext: string): string {
  return `تو دستیار فروش هوشمند شرکت بیواز هستی. بیواز یک فروشگاه آنلاین تخصصی سیستم‌های امنیتی، دزدگیر، حسگر و تجهیزات هوشمند در ایران است.

وظیفه‌ات:
۱. مشاوره صادقانه و دقیق به مشتریان برای انتخاب سیستم امنیتی مناسب
۲. معرفی محصولات مرتبط با نیاز مشتری
۳. پاسخ به سوالات فنی
۴. دریافت شماره تماس برای پیگیری توسط کارشناس

قوانین مهم:
- همیشه به فارسی پاسخ بده
- کوتاه و واضح صحبت کن (حداکثر ۳-۴ جمله)
- اگر مشتری قصد خرید دارد، شماره تماسش را بگیر
- قیمت‌ها را به تومان بگو
- اگر سوالی خارج از حوزه امنیت و محصولات بیواز بود، مودبانه برگرد به موضوع اصلی
- از ایموجی‌های مناسب استفاده کن ولی زیاده‌روی نکن

اطلاعات شرکت:
- بیواز طراح و سازنده سیستم‌های هوشمند و حفاظتی اماکن (دزدگیر اماکن) است
- محصولات اصلی: دزدگیر BH11 (نمایشگر رنگی فارسی، اتصال خط تلفن و سیم‌کارت) و BH10 (اقتصادی، فقط سیم‌کارت)
- گارانتی طلایی ۲۴ ماهه روی تمام محصولات
- پشتیبانی ۲۴/۷ — تلفن: ۰۲۱-۴۷۹۵۶ — ایمیل: info@beewaz-co.com

${productContext}

وقتی مشتری شماره تماسش را داد، پیامت را با این متن دقیق شروع کن:
"✅ شماره [شماره] ثبت شد."`
}

// ── Session helpers ───────────────────────────────────────────────────────────

async function getOrCreateSession(
  sessionId: string | undefined,
  visitorToken: string | undefined,
): Promise<string> {
  if (sessionId) {
    const [existing] = await db
      .select({ id: chatSessions.id })
      .from(chatSessions)
      .where(eq(chatSessions.id, sessionId))
      .limit(1)
    if (existing) return existing.id
  }

  const [created] = await db
    .insert(chatSessions)
    .values({
      visitorToken: visitorToken ?? null,
      status: 'active',
    })
    .returning({ id: chatSessions.id })

  return created!.id
}

// ── Route handler ─────────────────────────────────────────────────────────────

interface ChatRequest {
  messages: { role: 'user' | 'model'; text: string }[]
  session_id?: string
  visitorToken?: string
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as ChatRequest

    if (!body.messages || body.messages.length === 0) {
      return NextResponse.json({ error: 'پیامی ارسال نشده' }, { status: 400 })
    }

    // ── 1. Session management ─────────────────────────────────────────────────
    const sessionId = await getOrCreateSession(body.session_id, body.visitorToken)

    // ── 2. Persist user message ───────────────────────────────────────────────
    const lastUserMsg = body.messages.findLast((m) => m.role === 'user')
    if (lastUserMsg) {
      await db.insert(chatMessages).values({
        sessionId,
        role: 'user',
        content: lastUserMsg.text,
      })
    }

    // ── 3. Build context and call AI ─────────────────────────────────────────
    const productContext = await getProductContext()
    const systemPrompt = buildSystemPrompt(productContext)
    const reply = await chat(body.messages, systemPrompt)

    // ── 4. Persist assistant response ─────────────────────────────────────────
    await db.insert(chatMessages).values({
      sessionId,
      role: 'assistant',
      content: reply,
    })

    // ── 5. Detect lead (phone number) ─────────────────────────────────────────
    const lastUserText = lastUserMsg?.text ?? ''
    const phoneMatch = lastUserText.match(/(\+98|0)?9\d{9}/)
    const leadCaptured = !!phoneMatch && reply.includes('✅')

    return NextResponse.json({
      message: reply,
      session_id: sessionId,
      leadCaptured,
      phone: leadCaptured ? phoneMatch![0] : undefined,
    })
  } catch (err) {
    console.error('[chat]', err)
    return NextResponse.json(
      { error: 'سرویس مشاوره موقتاً در دسترس نیست. لطفاً با شماره مستقیم تماس بگیرید.' },
      { status: 500 },
    )
  }
}
