import NextAuth from 'next-auth'
import { NextResponse } from 'next/server'
import { authConfig } from '@/lib/auth.config'

// proxy = جایگزین middleware در Next.js 16.
// از auth.config (بدون DB/bcrypt) استفاده می‌کند تا edge-safe باشد.
const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { pathname } = req.nextUrl

  // اضافه کردن x-pathname برای استفاده در root layout
  const requestId = crypto.randomUUID()

  if (pathname.startsWith('/admin')) {
    if (!req.auth) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
    // نقش‌های کارمندی اجازه ورود به پنل دارند؛ دسترسی دقیق هر بخش
    // با RBAC در سطح صفحه/API و نوار کناری کنترل می‌شود.
    // @ts-expect-error -- custom role field
    const role = req.auth.user?.role as string | undefined
    if (role !== 'admin' && role !== 'sales_agent') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  if (pathname.startsWith('/profile') && !req.auth) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // pass-through: اضافه کردن هدرها
  const response = NextResponse.next()
  response.headers.set('x-pathname', pathname)
  response.headers.set('x-request-id', requestId)
  return response
})

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|fonts|images|icons).*)'
  ],
}
