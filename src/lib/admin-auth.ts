import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'

export async function requireAdmin(req?: NextRequest): Promise<{ ok: boolean; error?: string }> {
  // ۱. بررسی NextAuth session — اگر role=admin یا sales_agent باشد اجازه داده می‌شود
  try {
    const session = await auth()
    const role = (session?.user as { role?: string } | undefined)?.role
    if (role === 'admin' || role === 'sales_agent') return { ok: true }
  } catch { /* noop */ }

  // ۲. بررسی ADMIN_TOKEN (fallback برای ابزارهای خارجی / CI)
  const token = process.env.ADMIN_TOKEN
  if (token) {
    try {
      const cookieStore = await cookies()
      const cookieToken = cookieStore.get('admin_token')?.value
      if (cookieToken === token) return { ok: true }
    } catch { /* noop */ }

    const authHeader = req?.headers?.get('authorization')
    if (authHeader === `Bearer ${token}`) return { ok: true }
  }

  // ۳. در development بدون توکن اجازه داده می‌شود
  if (process.env.NODE_ENV !== 'production') return { ok: true }

  return { ok: false, error: 'Unauthorized' }
}
