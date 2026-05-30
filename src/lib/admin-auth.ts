/**
 * ادمین‌ آتنتیکیشن — Phase 1
 *
 * در فاز ۱ از یک env token ساده استفاده می‌شود.
 * در فاز ۲ با NextAuth/Better-Auth و session مناسب جایگزین می‌شود.
 */

import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

export async function requireAdmin(req?: NextRequest): Promise<{ ok: boolean; error?: string }> {
  const token = process.env.ADMIN_TOKEN

  if (!token) {
    // در production بدون ADMIN_TOKEN دسترسی مسدود است
    if (process.env.NODE_ENV === 'production') {
      return { ok: false, error: 'ADMIN_TOKEN not configured' }
    }
    // فقط در development بدون توکن اجازه داده می‌شود
    return { ok: true }
  }

  // بررسی کوکی ادمین
  try {
    const cookieStore = await cookies()
    const cookieToken = cookieStore.get('admin_token')?.value
    if (cookieToken === token) return { ok: true }
  } catch {
    // در برخی محیط‌ها cookies() در route handler کار نمی‌کند
  }

  // بررسی Authorization header
  const authHeader = req?.headers?.get('authorization')
  if (authHeader === `Bearer ${token}`) return { ok: true }

  return { ok: false, error: 'Unauthorized' }
}
