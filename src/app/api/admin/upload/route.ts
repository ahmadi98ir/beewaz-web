import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'

export async function POST(req: Request) {
  const { error } = await requireAdmin()
  if (error) return error

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'فایل ارسال نشد' }, { status: 400 })

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'فرمت فایل مجاز نیست (jpg, png, webp, gif)' }, { status: 400 })
  }

  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    return NextResponse.json({ error: 'حجم فایل نباید بیشتر از ۵ مگابایت باشد' }, { status: 400 })
  }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const filename = `${randomUUID()}.${ext}`
  // در standalone Docker از /app/public/uploads استفاده می‌کنیم (volume mount)
  const uploadDir = join('/app/public/uploads/products')

  await mkdir(uploadDir, { recursive: true }).catch(() => {
    // fallback برای dev محلی
    return mkdir(join(process.cwd(), 'public', 'uploads', 'products'), { recursive: true })
  })

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // سعی می‌کنیم در مسیر Docker بنویسیم، اگر نشد مسیر dev
  try {
    await writeFile(join('/app/public/uploads/products', filename), buffer)
  } catch {
    await writeFile(join(process.cwd(), 'public', 'uploads', 'products', filename), buffer)
  }

  return NextResponse.json({ url: `/api/serve/products/${filename}` })
}