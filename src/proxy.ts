import NextAuth from 'next-auth'
import { NextResponse } from 'next/server'
import { authConfig } from '@/lib/auth.config'
import { locales, defaultLocale, isValidLocale } from '@/lib/i18n/locales'
import type { Locale } from '@/lib/i18n/locales'

// proxy = جایگزین middleware در Next.js 16.
// از auth.config (بدون DB/bcrypt) استفاده می‌کند تا edge-safe باشد.
const { auth } = NextAuth(authConfig)

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

function hostFromUrl(value: string | null): string | null {
  if (!value) return null
  try {
    return new URL(value).host
  } catch {
    return null
  }
}

/** زبان کاربر را از کوکی → Accept-Language header → پیش‌فرض تشخیص می‌دهد */
function detectLocale(req: Parameters<Parameters<typeof auth>[0]>[0]): Locale {
  // ۱. کوکی صریح کاربر
  const cookie = req.cookies.get('NEXT_LOCALE')?.value
  if (cookie && isValidLocale(cookie)) return cookie

  // ۲. Accept-Language header
  const acceptLang = req.headers.get('accept-language') ?? ''
  for (const part of acceptLang.split(',')) {
    const tag = part.split(';')[0]?.trim().toLowerCase().slice(0, 2)
    if (tag && isValidLocale(tag)) return tag
  }

  return defaultLocale
}

export default auth((req) => {
  const { pathname } = req.nextUrl

  // محافظت CSRF برای درخواست‌های تغییردهنده روی API
  if (pathname.startsWith('/api/') && !SAFE_METHODS.has(req.method)) {
    const exempt =
      pathname.startsWith('/api/auth/') ||
      pathname.startsWith('/api/zarinpal/verify') ||
      pathname.startsWith('/api/idpay/verify')
    const hasBearer = req.headers.get('authorization')?.startsWith('Bearer ')
    if (!exempt && !hasBearer) {
      const host = req.headers.get('host')
      const sourceHost = hostFromUrl(req.headers.get('origin')) ?? hostFromUrl(req.headers.get('referer'))
      if (!host || !sourceHost || sourceHost !== host) {
        return NextResponse.json({ error: 'CSRF check failed' }, { status: 403 })
      }
    }
  }

  const requestId = crypto.randomUUID()
  const locale    = detectLocale(req)

  if (pathname.startsWith('/admin')) {
    if (!req.auth) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
    const role = req.auth.user?.role as string | undefined
    if (!role || role === 'customer') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  if (pathname.startsWith('/profile') && !req.auth) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // pass-through: اضافه کردن هدرها (locale برای استفاده در layout/server components)
  const response = NextResponse.next()
  response.headers.set('x-pathname', pathname)
  response.headers.set('x-request-id', requestId)
  response.headers.set('x-locale', locale)
  return response
})

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|fonts|images|icons).*)'
  ],
}
