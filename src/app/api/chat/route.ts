import { NextRequest, NextResponse } from 'next/server'
import { chat } from '@/lib/gemini'
import { db } from '@/lib/db'
import { products, categories } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

// ── Load active products for context ─────────────────────────────────────────

async function getProductContext(): Promise<string> {
  try {
    const rows = await db
      .select({
        name: products.nameFa,
        price: products.price,
        description: products.descriptionFa,
        stock: products.stock,
        category: categories.nameFa,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(and(eq(products.status, 'active')))
      .limit(30)

    if (rows.length === 0) return 'محصولات موجود: اطلاعاتی در دسترس نیست.'

    const lines = rows.map((p) => {
      const price = Math.floor(p.price / 10).toLocaleString('fa-IR')
      return `- ${p.name} | دسته: ${p.category ?? 'عمومی'} | قیمت: ${price} تومان${p.stock === 0 ? ' (ناموجود)' : ''}`
    })
    return 'محصولات موجود در فروشگاه:\n' + lines.join('\n')
  } catch {
    return ''
  }
}

// ── System Prompt ─────────────────────────────────────────────────────────────

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
- هر دستگاه ۴ زون سیمی و ۳۰ زون بی‌سیم دارد
- نصب توسط نمایندگان بیواز در سراسر کشور و تکنسین‌های متخصص در تهران
- گارانتی طلایی ۲۴ ماهه روی تمام محصولات
- پشتیبانی ۲۴/۷ — تلفن: ۰۲۱-۴۷۹۵۶ — ایمیل: info@beewaz-co.com
- ساعت کاری: شنبه تا چهارشنبه ۸ تا ۱۷، پنجشنبه ۸ تا ۱۲
- ارسال سریع به سراسر ایران

${productContext}

وقتی مشتری شماره تماسش را داد، پیامت را با این متن دقیق شروع کن:
"✅ شماره [شماره] ثبت شد."
این به سیستم می‌گوید که lead ذخیره کند.`
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface GeminiChatRequest {
  messages: { role: 'user' | 'model'; text: string }[]
  sessionData?: Record<string, string>
}

// ── Handler ───────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as GeminiChatRequest

    if (!body.messages || body.messages.length === 0) {
      return NextResponse.json({ error: 'پیامی ارسال نشده' }, { status: 400 })
    }

    const productContext = await getProductContext()
    const systemPrompt = buildSystemPrompt(productContext)

    const reply = await chat(body.messages, systemPrompt)

    // Detect phone number in the conversation for lead capture
    const lastUserMessage = body.messages.findLast((m) => m.role === 'user')?.text ?? ''
    const phoneMatch = lastUserMessage.match(/(\+98|0)?9\d{9}/)
    const leadCaptured = !!phoneMatch && reply.includes('✅')

    return NextResponse.json({
      message: reply,
      leadCaptured,
      phone: leadCaptured ? phoneMatch![0] : undefined,
      sessionData: body.sessionData ?? {},
    })
  } catch (err) {
    console.error('[chat]', err)
    return NextResponse.json(
      { error: 'سرویس مشاوره موقتاً در دسترس نیست. لطفاً با شماره مستقیم تماس بگیرید.' },
      { status: 500 },
    )
  }
}
