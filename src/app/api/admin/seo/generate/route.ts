/**
 * POST /api/admin/seo/generate — دستیار سئو هوشمند
 * تولید meta title / description / کلمات کلیدی برای محصول یا مقاله
 */
import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/rbac'
import { generateText } from '@/lib/gemini'

interface Body {
  type?: 'product' | 'article'
  title?: string
  description?: string
  category?: string
}

export async function POST(req: NextRequest) {
  // محصولات و محتوا — هر کدام مجوز نوشتن داشته باشد کافی است
  const auth = await requirePermission(req, 'products:write')
  if (auth instanceof NextResponse) {
    // اگر مجوز محصولات نبود، مجوز محتوا را امتحان کن
    const contentAuth = await requirePermission(req, 'content:write')
    if (contentAuth instanceof NextResponse) return contentAuth
  }

  const body = await req.json() as Body
  const title = (body.title ?? '').trim()
  if (!title) {
    return NextResponse.json({ error: 'عنوان الزامی است' }, { status: 400 })
  }

  const kind = body.type === 'article' ? 'مقاله' : 'محصول'
  const prompt = `تو یک متخصص سئو فارسی هستی. برای ${kind} زیر، خروجی سئوی بهینه تولید کن.

عنوان: ${title}
${body.category ? `دسته‌بندی: ${body.category}` : ''}
${body.description ? `توضیحات: ${body.description.slice(0, 500)}` : ''}

دقیقاً و فقط یک JSON معتبر با این ساختار برگردان (بدون متن اضافه، بدون markdown):
{
  "metaTitle": "عنوان سئو حداکثر ۶۰ کاراکتر، جذاب و شامل کلمه کلیدی اصلی",
  "metaDescription": "توضیح متا بین ۱۲۰ تا ۱۵۵ کاراکتر، ترغیب‌کننده برای کلیک",
  "keywords": ["کلمه کلیدی ۱", "کلمه کلیدی ۲", "کلمه کلیدی ۳", "کلمه کلیدی ۴", "کلمه کلیدی ۵"]
}`

  try {
    const raw = await generateText(prompt)
    // استخراج JSON از پاسخ
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'پاسخ نامعتبر از هوش مصنوعی', raw }, { status: 502 })
    }
    const parsed = JSON.parse(jsonMatch[0]) as {
      metaTitle?: string; metaDescription?: string; keywords?: string[]
    }
    return NextResponse.json({
      metaTitle: parsed.metaTitle ?? '',
      metaDescription: parsed.metaDescription ?? '',
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
    })
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: 'خطا در تولید محتوای سئو', detail }, { status: 500 })
  }
}
