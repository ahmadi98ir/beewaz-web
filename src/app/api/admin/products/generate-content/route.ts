import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { generateText } from '@/lib/gemini'

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as { name?: string; category?: string; specs?: { keyFa: string; valueFa: string }[] }

  if (!body.name) {
    return NextResponse.json({ error: 'نام محصول الزامی است' }, { status: 400 })
  }

  const specsText = body.specs?.length
    ? body.specs.map((s) => `- ${s.keyFa}: ${s.valueFa}`).join('\n')
    : ''

  const prompt = `برای یک محصول فروشگاه اینترنتی ایرانی تجهیزات امنیتی (برند بیواز)، یک توضیحات کامل و حرفه‌ای بنویس.

اطلاعات محصول:
- نام: ${body.name}
- دسته‌بندی: ${body.category ?? 'تجهیزات امنیتی'}
${specsText ? `- مشخصات فنی:\n${specsText}` : ''}

قوانین:
- بین ۲ تا ۴ پاراگراف کوتاه، روان و قابل‌فهم برای مشتری عادی
- لحن حرفه‌ای و قابل‌اعتماد، بدون اغراق و بدون ایموجی
- روی کاربرد، مزایا و دلیل انتخاب محصول تمرکز کن
- فقط متن توضیحات را برگردان، بدون عنوان یا توضیح اضافه`

  try {
    const text = await generateText(prompt)
    return NextResponse.json({ descriptionFa: text.trim() })
  } catch (err) {
    console.error('[generate-content]', err)
    return NextResponse.json({ error: 'خطا در تولید محتوا' }, { status: 500 })
  }
}
