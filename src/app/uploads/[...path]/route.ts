import { readFile } from 'fs/promises'
import { join } from 'path'

// Next.js standalone در startup فقط فایل‌های موجود در public/ را ایندکس می‌کند.
// فایل‌های آپلودشده بعد از startup در ایندکس نیستند. این route آن‌ها را مستقیماً
// از filesystem (یا volume mount) می‌خواند و serve می‌کند.

const MIME: Record<string, string> = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg',
  png: 'image/png', webp: 'image/webp',
  gif: 'image/gif', svg: 'image/svg+xml',
  avif: 'image/avif',
}

const PUBLIC_UPLOADS = join(process.cwd(), 'public', 'uploads')

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params
  const filename = path.join('/')

  // جلوگیری از path traversal
  if (filename.includes('..'))
    return new Response('Forbidden', { status: 403 })

  const ext = filename.split('.').pop()?.toLowerCase() ?? ''
  const mime = MIME[ext]
  if (!mime) return new Response('Not Found', { status: 404 })

  try {
    const buffer = await readFile(join(PUBLIC_UPLOADS, filename))
    return new Response(buffer, {
      headers: {
        'Content-Type': mime,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch {
    return new Response('Not Found', { status: 404 })
  }
}
