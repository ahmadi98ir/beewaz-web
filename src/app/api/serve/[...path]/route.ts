import { readFile } from 'fs/promises'
import { join } from 'path'
import { NextResponse } from 'next/server'

const MIME: Record<string, string> = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg',
  png: 'image/png', webp: 'image/webp', gif: 'image/gif',
}

export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  const filename = path.join('/')
  const ext = filename.split('.').pop()?.toLowerCase() ?? ''
  const mime = MIME[ext]
  if (!mime) return NextResponse.json({ error: 'not found' }, { status: 404 })

  // امنیت: مسیر traversal رو بلاک کن
  if (filename.includes('..')) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  const dockerPath = join('/app/public/uploads', filename)
  const devPath = join(process.cwd(), 'public', 'uploads', filename)

  let buffer: Buffer
  try {
    buffer = await readFile(dockerPath)
  } catch {
    try {
      buffer = await readFile(devPath)
    } catch {
      return NextResponse.json({ error: 'not found' }, { status: 404 })
    }
  }

  return new Response(buffer.buffer as ArrayBuffer, {
    headers: {
      'Content-Type': mime,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}