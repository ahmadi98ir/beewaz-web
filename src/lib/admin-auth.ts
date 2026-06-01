import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { verifyOrigin } from '@/lib/csrf'

export async function requireAdmin(req?: NextRequest): Promise<{ ok: boolean; error?: string }> {
  // ۰. دسترسی با ADMIN_TOKEN (برای ابزارهای خارجی / CI) — معاف از CSRF
  const token = process.env.ADMIN_TOKEN
  if (token && req) {
    const authHeader = req.headers?.get('authorization')
    if (authHeader === `Bearer ${token}`) return { ok: true }
  }

  // ۱. برای دسترسی مبتنی بر کوکی/سشن، در درخواست‌های تغییردهنده CSRF بررسی شود
  if (req && !verifyOrigin(req)) {
    return { ok: false, error: 'CSRF check failed' }
  }

  // ۲. بررسی NextAuth session — هر نقش کارمندی (غیر از مشتری) اجازه ورود کلی دارد.
  //    کنترل دقیق هر عملیات با requirePermission انجام می‌شود.
  try {
    const session = await auth()
    const role = (session?.user as { role?: string } | undefined)?.role
    if (role && role !== 'customer') return { ok: true }
  } catch { /* noop */ }

  // ۳. بررسی ADMIN_TOKEN از طریق کوکی
  if (token) {
    try {
      const cookieStore = await cookies()
      const cookieToken = cookieStore.get('admin_token')?.value
      if (cookieToken === token) return { ok: true }
    } catch { /* noop */ }
  }

  return { ok: false, error: 'Unauthorized' }
}
