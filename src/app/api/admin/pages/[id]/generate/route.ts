/**
 * POST /api/admin/pages/[id]/generate — تولید محتوای بلاک با هوش مصنوعی
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { generateText } from '@/lib/gemini'
import type { Block } from '@/lib/db/schema'

type Params = { params: Promise<{ id: string }> }

const SYSTEM_PROMPT = `تو یک متخصص تولید محتوای فارسی برای سایت فروش تجهیزات دزدگیر و امنیتی «بیواز» هستی.
بر اساس موضوع داده‌شده توسط کاربر، یک صفحه کامل با ساختار بلاک تولید کن.
خروجی باید **فقط** یک JSON معتبر باشد (بدون متن اضافه، بدون markdown fence)، با این ساختار دقیق:

{
  "metaTitle": "عنوان کوتاه برای سئو (حداکثر 60 کاراکتر)",
  "metaDesc": "توضیح متا برای سئو (حداکثر 160 کاراکتر)",
  "blocks": [
    { "type": "hero", "props": { "title": "...", "subtitle": "...", "ctaText": "...", "ctaUrl": "/shop" } },
    { "type": "text", "props": { "content": "<p>...</p>" } },
    { "type": "features", "props": { "title": "...", "items": [{ "icon": "✅", "title": "...", "desc": "..." }] } },
    { "type": "faq", "props": { "title": "...", "items": [{ "q": "...", "a": "..." }] } },
    { "type": "cta", "props": { "title": "...", "subtitle": "...", "btnText": "...", "btnUrl": "/shop" } }
  ]
}

نوع بلاک‌ها فقط می‌توانند یکی از این‌ها باشند: hero, text, image, gallery, cta, faq, features, divider.
بین ۳ تا ۶ بلاک متناسب با موضوع تولید کن. لحن محتوا حرفه‌ای، فارسی روان و مرتبط با حوزه امنیت/دزدگیر باشد مگر اینکه کاربر موضوع دیگری خواسته باشد.`

function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fenced?.[1]) return fenced[1].trim()
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start !== -1 && end !== -1) return text.slice(start, end + 1)
  return text
}

export async function POST(req: NextRequest, { params }: Params) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await params

  const body = await req.json() as { topic?: string }
  const topic = body.topic?.trim()
  if (!topic) return NextResponse.json({ error: 'موضوع الزامی است' }, { status: 400 })

  let raw: string
  try {
    raw = await generateText(`${SYSTEM_PROMPT}\n\nموضوع صفحه: ${topic}`)
  } catch (err) {
    console.error('[ai-generate]', err)
    return NextResponse.json({ error: 'خطا در ارتباط با سرویس هوش مصنوعی' }, { status: 502 })
  }

  let parsed: { metaTitle?: string; metaDesc?: string; blocks?: { type: string; props: Record<string, unknown> }[] }
  try {
    parsed = JSON.parse(extractJson(raw))
  } catch {
    return NextResponse.json({ error: 'پاسخ هوش مصنوعی قابل پردازش نبود — دوباره تلاش کنید' }, { status: 502 })
  }

  const VALID_TYPES = new Set(['hero', 'text', 'image', 'gallery', 'cta', 'faq', 'features', 'divider'])
  const blocks: Block[] = (parsed.blocks ?? [])
    .filter((b) => VALID_TYPES.has(b.type))
    .map((b) => ({
      id: crypto.randomUUID().slice(0, 8),
      type: b.type as Block['type'],
      props: b.props ?? {},
    }))

  if (blocks.length === 0)
    return NextResponse.json({ error: 'هوش مصنوعی هیچ بلاکی تولید نکرد' }, { status: 502 })

  return NextResponse.json({
    blocks,
    metaTitle: parsed.metaTitle ?? '',
    metaDesc: parsed.metaDesc ?? '',
  })
}
