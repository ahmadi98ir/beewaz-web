/**
 * لاگ‌گیری ساختاریافته
 *
 * خروجی JSON روی stdout/stderr (مناسب جمع‌آوری توسط Docker/Coolify).
 * در صورت تنظیم متغیر محیطی LOG_WEBHOOK_URL، خطاها به آن وب‌هوک هم ارسال می‌شوند
 * (مثلاً کانال تلگرام/اسلک یا سرویس monitoring).
 */

type Level = 'debug' | 'info' | 'warn' | 'error'

interface LogFields {
  [key: string]: unknown
}

const LOG_WEBHOOK_URL = process.env.LOG_WEBHOOK_URL

function emit(level: Level, message: string, fields?: LogFields) {
  const entry = {
    level,
    message,
    time: new Date().toISOString(),
    ...fields,
  }
  const line = JSON.stringify(entry)

  if (level === 'error' || level === 'warn') {
    console.error(line)
  } else {
    console.log(line)
  }

  // ارسال خطاها به وب‌هوک خارجی (fire-and-forget)
  if (level === 'error' && LOG_WEBHOOK_URL) {
    void fetch(LOG_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: `🔴 ${message}`, ...entry }),
    }).catch(() => {})
  }
}

export const logger = {
  debug: (message: string, fields?: LogFields) => emit('debug', message, fields),
  info:  (message: string, fields?: LogFields) => emit('info', message, fields),
  warn:  (message: string, fields?: LogFields) => emit('warn', message, fields),
  error: (message: string, error?: unknown, fields?: LogFields) =>
    emit('error', message, {
      ...fields,
      error: error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : error,
    }),
}
