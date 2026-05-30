import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { generateText } from '@/lib/gemini'

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as { name?: string; description?: string; category?: string }

  if (!body.name) {
    return NextResponse.json({ error: 'نام محصول الزامی است' }, { status: 400 })
  }

  const prompt = `برای یک محصول فروشگاه اینترنتی ایرانی، متا تایتل و متا دسکریپشن سئو بنویس.

اطلاعات محصول:
- نام: ${body.name}
- دسته‌بندی: ${body.category ?? 'تجهیزات امنیتی'}
- توضیحات: ${body.description ?? ''}

خروجی را دقیقاً در این فرمت JSON بده (بدون توضیح اضافه):
{
  "metaTitle": "عنوان سئو (حداکثر ۶۰ کاراکتر، شامل کلمه کلیدی اصلی و نام برند بیواز)",
  "metaDesc": "توضیحات متا (حداکثر ۱۵۵ کاراکتر، جذاب و دارای فراخوان به عمل، بدون استفاده از ایموجی)"
}`

  try {
    const raw = await generateText(prompt)

    // Extract JSON from response
    const match = raw.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('Invalid response format')

    const parsed = JSON.parse(match[0]) as { metaTitle: string; metaDesc: string }

    return NextResponse.json({
      metaTitle: parsed.metaTitle?.slice(0, 60) ?? '',
      metaDesc: parsed.metaDesc?.slice(0, 155) ?? '',
    })
  } catch (err) {
    console.error('[generate-seo]', err)
    return NextResponse.json({ error: 'خطا در تولید متا' }, { status: 500 })
  }
}
