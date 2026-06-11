import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

// در Docker: process.cwd() = /app (WORKDIR) → /app/public/uploads = volume mount
// در dev:    process.cwd() = ریشه پروژه      → <root>/public/uploads
const PUBLIC_DIR = join(process.cwd(), 'public')

function datePath(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}/${m}/${d}`
}

async function storeFile(buffer: Buffer, filename: string, subPath: string): Promise<string> {
  const rel = `uploads/${subPath}/${filename}`
  const dir = join(PUBLIC_DIR, 'uploads', subPath)
  await mkdir(dir, { recursive: true })
  await writeFile(join(PUBLIC_DIR, rel), buffer)
  return `/${rel}`
}

export async function POST(req: Request) {
  const _auth = await requireAdmin()
  if (!_auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'فایل ارسال نشد' }, { status: 400 })

  if (!ALLOWED_TYPES.includes(file.type))
    return NextResponse.json({ error: 'فقط فرمت‌های JPG، PNG و WebP مجاز هستند' }, { status: 400 })

  if (file.size > MAX_SIZE)
    return NextResponse.json({ error: 'حجم فایل نباید بیشتر از ۵ مگابایت باشد' }, { status: 400 })

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const filename = `${randomUUID()}.${ext}`
  const subPath = `products/${datePath()}`

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  try {
    const url = await storeFile(buffer, filename, subPath)
    return NextResponse.json({ url })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[upload] storeFile failed:', msg)
    return NextResponse.json(
      { error: `خطای ذخیره‌سازی فایل روی سرور: ${msg}` },
      { status: 500 },
    )
  }
}
