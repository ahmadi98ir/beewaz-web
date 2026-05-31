/**
 * محافظت CSRF با بررسی Origin/Referer
 *
 * برای درخواست‌های تغییردهنده (POST/PUT/PATCH/DELETE) مبدأ درخواست باید با
 * میزبان سرور یکی باشد. این روش همان دفاعی است که Next.js برای Server Actions
 * استفاده می‌کند و به توکن جداگانه نیاز ندارد چون به کوکی httpOnly تکیه دارد.
 */

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

function hostFromUrl(value: string | null): string | null {
  if (!value) return null
  try {
    return new URL(value).host
  } catch {
    return null
  }
}

/**
 * برمی‌گرداند که آیا درخواست از نظر CSRF امن است یا نه.
 * متدهای امن (GET/HEAD/OPTIONS) همیشه مجازند.
 */
export function verifyOrigin(req: Request): boolean {
  if (SAFE_METHODS.has(req.method)) return true

  const host = req.headers.get('host')
  if (!host) return false

  // در صورت وجود، Origin معتبرترین منبع است
  const originHost = hostFromUrl(req.headers.get('origin'))
  if (originHost) return originHost === host

  // در نبود Origin، به Referer رجوع می‌کنیم
  const refererHost = hostFromUrl(req.headers.get('referer'))
  if (refererHost) return refererHost === host

  // هیچ‌کدام موجود نبود → رد می‌کنیم (درخواست مرورگری معمولاً یکی را دارد)
  return false
}
