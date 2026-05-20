/**
 * Middleware اولیه — Phase 1.1
 *
 * فعلاً فقط هدرهای امنیتی پایه را اضافه می‌کند.
 * در فاز ۱.۲ منطق Auth.js + Rate-limit، و در فاز ۱.۳ منطق i18n
 * (تشخیص locale از Cookie/Header) اضافه می‌شود.
 */

import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // بعضی هدرها در next.config.ts ست شده‌اند، اینجا فقط Request-ID
  const requestId = crypto.randomUUID()
  response.headers.set('x-request-id', requestId)

  // pathname را برای استفاده در server components (layout.tsx) ست می‌کنیم
  response.headers.set('x-pathname', request.nextUrl.pathname)

  // در توسعه، شناسه درخواست برای trace
  if (process.env.NODE_ENV === 'development') {
    response.headers.set('x-debug-locale', request.headers.get('accept-language') ?? 'unknown')
  }

  return response
}

// روی همه routeها به جز فایل‌های static و _next اعمال می‌شود
export const config = {
  matcher: [
    /*
     * Match تمام مسیرها به جز:
     * - _next/static (فایل‌های استاتیک)
     * - _next/image (بهینه‌سازی تصویر)
     * - favicon.ico, robo