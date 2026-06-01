/**
 * Rate limiter ساده مبتنی بر حافظه
 * برای production با چند instance از Redis استفاده کنید (Upstash)
 * این پیاده‌سازی برای single-instance کافی است
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// پاکسازی هر ۵ دقیقه برای جلوگیری از نشت حافظه
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) store.delete(key)
  }
}, 5 * 60 * 1000)

/**
 * بررسی و ثبت درخواست برای rate limiting
 * @param key کلید یکتا (مثلاً IP + endpoint)
 * @param limit حداکثر تعداد درخواست در بازه
 * @param windowMs بازه زمانی (میلی‌ثانیه)
 * @returns true اگر مجاز، false اگر محدود شده
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (entry.count >= limit) return false

  entry.count++
  return true
}

/** IP کاربر را از Request استخراج می‌کند */
export function getClientIp(req: Request): string {
  const headers = req instanceof Request ? req.headers : new Headers()
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    headers.get('x-real-ip') ??
    'unknown'
  )
}
