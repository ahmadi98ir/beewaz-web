import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

function hostFromUrl(value: string | null): string | null {
  if (!value) return null
  try {
    return new URL(value).host
  } catch {
    return null
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // محافظت CSRF برای همه درخواست‌های تغییردهنده روی API
  if (pathname.startsWith('/api/') && !SAFE_METHODS.has(request.method)) {
    // مسیرهای auth و callback درگاه‌های پرداخت از این بررسی معاف‌اند
    // (NextAuth محافظت داخلی دارد و درگاه‌ها از دامنه دیگری برمی‌گردند)
    const exempt =
      pathname.startsWith('/api/auth/') ||
      pathname.startsWith('/api/zarinpal/verify') ||
      pathname.startsWith('/api/idpay/verify')

    if (!exempt) {
      // درخواست‌هایی که با Bearer token می‌آیند (ابزار خارجی/CI) معاف‌اند
      const hasBearer = request.headers.get('authorization')?.startsWith('Bearer ')
      if (!hasBearer) {
        const host = request.headers.get('host')
        const originHost = hostFromUrl(request.headers.get('origin'))
        const refererHost = hostFromUrl(request.headers.get('referer'))
        const sourceHost = originHost ?? refererHost

        if (!host || !sourceHost || sourceHost !== host) {
          return NextResponse.json({ error: 'CSRF check failed' }, { status: 403 })
        }
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*'],
}
