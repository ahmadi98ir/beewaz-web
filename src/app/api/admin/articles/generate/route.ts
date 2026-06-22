/**
 * POST /api/admin/articles/generate — تولید محتوای مقاله و سئو با هوش مصنوعی
 *
 * بدون [id] است چون مقاله جدید تا اولین ذخیره، ردیفی در دیتابیس ندارد.
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { generateText } from '@/lib/gemini'

const SYSTEM_PROMPT = `تو یک متخصص تولید محتوای فارسی و سئو برای وبلاگ سایت فروش تجهیزات دزدگیر و امنیتی «بیواز» هستی.
بر اساس موضوع داده‌شده توسط کاربر، یک مقاله کامل و آماده انتشار تولید کن.
خروجی باید **فقط** یک JSON معتبر باشد (بدون متن اضافه، بدون markdown fence)، با این ساختار دقیق:

{
  "titleFa": "عنوان جذاب مقاله (حداکثر 70 کاراکتر)",
  "slug": "نسخه-لاتین-خلاصه-عنوان-با-خط-تیره",
  "excerptFa": "خلاصه یک یا دو جمله‌ای مقاله (حداکثر 250 کاراکتر)",
  "bodyFa": "<p>متن کامل مقاله با تگ‌های HTML ساده مثل p, h2, h3, ul, li, strong</p>",
  "tags": ["تگ۱", "تگ۲", "تگ۳"],
  "metaTitle": "عنوان سئو برای گوگل (حداکثر 60 کاراکتر)",
  "metaDesc": "توضیح متا برای سئو (حداکثر 160 کاراکتر)"
}

متن مقاله (bodyFa) باید حداقل ۴۰۰ کلمه، ساختارمند با زیرتیتر (h2/h3)، حرفه‌ای و فارسی روان باشد و مرتبط با حوزه امنیت/دزدگیر/تجهیزات حفاظتی باشد مگر اینکه کاربر موضوع دیگری خواسته باشد.
بین ۳ تا ۶ تگ مرتبط با موضوع پیشنهاد بده. slug فقط حروف لاتین کوچک، عدد و خط‌تیره باشد.`

function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fenced?.[1]) return fenced[1].trim()
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start !== -1 && end !== -1) return text.slice(start, end + 1)
  return text
}

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as { topic?: string; category?: string }
  const topic = body.topic?.trim()
  if (!topic) return NextResponse.json({ error: 'موضوع الزامی است' }, { status: 400 })

  const categoryHint = body.category === 'knowledge_base' ? 'پایگاه دانش' : 'وبلاگ'

  let raw: string
  try {
    raw = await generateText(`${SYSTEM_PROMPT}\n\nدسته‌بندی مقاله: ${categoryHint}\nموضوع مقاله: ${topic}`)
  } catch (err) {
    console.error('[ai-generate-article]', err)
    return NextResponse.json({ error: 'خطا در ارتباط با سرویس هوش مصنوعی' }, { status: 502 })
  }

  let parsed: {
    titleFa?: string; slug?: string; excerptFa?: string; bodyFa?: string
    tags?: string[]; metaTitle?: string; metaDesc?: string
  }
  try {
    parsed = JSON.parse(extractJson(raw))
  } catch {
    return NextResponse.json({ error: 'پاسخ هوش مصنوعی قابل پردازش نبود — دوباره تلاش کنید' }, { status: 502 })
  }

  if (!parsed.bodyFa?.trim())
    return NextResponse.json({ error: 'هوش مصنوعی محتوایی تولید نکرد' }, { status: 502 })

  return NextResponse.json({
    titleFa:   parsed.titleFa ?? '',
    slug:      parsed.slug ? slugify(parsed.slug) : (parsed.titleFa ? slugify(parsed.titleFa) : ''),
    excerptFa: parsed.excerptFa ?? '',
    bodyFa:    parsed.bodyFa,
    tags:      Array.isArray(parsed.tags) ? parsed.tags.filter((t) => typeof t === 'string' && t.trim()) : [],
    metaTitle: parsed.metaTitle ?? '',
    metaDesc:  parsed.metaDesc ?? '',
  })
}
