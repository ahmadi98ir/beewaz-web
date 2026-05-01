import { NextRequest, NextResponse } from 'next/server'
import type { ChatRequest, ChatResponse, SessionData } from '@/types/chat'

// ── Conversation Script ────────────────────────────────────────────────────
// این ساختار برای جایگزینی راحت با Claude API طراحی شده است.
// کافی است تابع `getBotResponse` را با یک API call عوض کنید.

const PHONE_REGEX = /^(\+98|0)?9\d{9}$/

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('98')) return '0' + digits.slice(2)
  if (digits.startsWith('9') && digits.length === 10) return '0' + digits
  return digits
}

function isValidPhone(phone: string): boolean {
  return PHONE_REGEX.test(phone.trim())
}

function buildRecommendation(data: SessionData): string {
  const placeMap: Record<string, string> = {
    'خانه مسکونی': 'مسکونی',
    'مغازه/دفتر': 'تجاری',
    'پارکینگ': 'پارکینگ',
    'انبار/سوله': 'صنعتی',
  }
  const place = placeMap[data.place ?? ''] ?? 'مسکونی'

  if (data.budget === 'حرفه‌ای') {
    return `دزدگیر هوشمند BW-C700 با WiFi+GSM برای محیط ${place}`
  }
  if (data.size === 'بیشتر از ۳۰۰ متر' || data.budget === 'متوسط') {
    return `دزدگیر ۸ زون BW-C500 برای محیط ${place}`
  }
  return `پکیج اقتصادی بیواز (دزدگیر مرکزی + ۴ حسگر + سیرن) برای محیط ${place}`
}

function getBotResponse(req: ChatRequest): ChatResponse {
  const { step, message, sessionData } = req
  const data: SessionData = { ...sessionData }

  switch (step) {
    // ── مرحله ۱: کجا می‌خواهید نصب کنید ──────────────────────────────────
    case 'GREETING':
      return {
        message:
          'سلام! به بیواز خوش آمدید 😊\nاینجام تا کمکتون کنم بهترین سیستم امنیتی رو پیدا کنید.\n\nبرای **کجا** دنبال دزدگیر می‌گردید؟',
        nextStep: 'ASK_PLACE',
        quickReplies: ['خانه مسکونی', 'مغازه/دفتر', 'پارکینگ', 'انبار/سوله'],
        sessionData: data,
      }

    // ── مرحله ۲: متراژ ───────────────────────────────────────────────────
    case 'ASK_PLACE': {
      data.place = message
      return {
        message: `خوبه! برای **${message}** گزینه‌های خوبی داریم.\n\nمتراژ تقریبی محیط چقدره؟`,
        nextStep: 'ASK_SIZE',
        quickReplies: ['کمتر از ۱۰۰ متر', '۱۰۰ تا ۳۰۰ متر', 'بیشتر از ۳۰۰ متر'],
        sessionData: data,
      }
    }

    // ── مرحله ۳: بودجه ───────────────────────────────────────────────────
    case 'ASK_SIZE': {
      data.size = message
      return {
        message:
          'ممنون! آخرین سوال — چه بودجه‌ای برای سیستم امنیتی در نظر دارید؟',
        nextStep: 'ASK_BUDGET',
        quickReplies: [
          'اقتصادی (تا ۳ میلیون)',
          'متوسط (۳ تا ۸ میلیون)',
          'حرفه‌ای (بیشتر از ۸ میلیون)',
        ],
        sessionData: data,
      }
    }

    // ── مرحله ۴: گرفتن شماره تماس ──────────────────────────────────────
    case 'ASK_BUDGET': {
      // استخراج دسته بودجه از پیام
      const budgetKey = message.includes('اقتصادی')
        ? 'اقتصادی'
        : message.includes('متوسط')
          ? 'متوسط'
          : 'حرفه‌ای'
      data.budget = budgetKey

      const recommendation = buildRecommendation(data)

      return {
        message: `عالی! بر اساس نیاز شما، **${recommendation}** پیشنهاد می‌کنیم.\n\nیه کارشناس باهاتون تماس می‌گیره و مشاوره کامل + قیمت دقیق می‌ده.\n\n📱 **شماره موبایلتون رو وارد کنید:**`,
        nextStep: 'ASK_PHONE',
        requirePhoneInput: true,
        sessionData: data,
      }
    }

    // ── مرحله ۵: دریافت و اعتبارسنجی شماره ──────────────────────────────
    case 'ASK_PHONE': {
      const rawPhone = message.trim()

      if (!isValidPhone(rawPhone)) {
        return {
          message:
            '⚠️ شماره موبایل معتبر نیست.\nلطفاً یه شماره ایرانی ۱۱ رقمی وارد کنید (مثل ۰۹۱۲۱۲۳۴۵۶۷):',
          nextStep: 'ASK_PHONE',
          requirePhoneInput: true,
          sessionData: data,
        }
      }

      data.phone = normalizePhone(rawPhone)

      return {
        message: `✅ ممنون!\nشماره **${data.phone}** با موفقیت ثبت شد.\n\nیه کارشناس بیواز معمولاً ظرف **۳۰ دقیقه** باهاتون تماس می‌گیره.\n\nسوال دیگه‌ای دارید؟`,
        nextStep: 'CONFIRM',
        leadCaptured: true,
        quickReplies: ['قیمت دزدگیرها', 'شرایط نصب', 'خیر، ممنون'],
        sessionData: data,
      }
    }

    // ── مرحله ۶: follow-up ───────────────────────────────────────────────
    case 'CONFIRM':
    case 'FOLLOW_UP': {
      if (message === 'خیر، ممنون') {
        return {
          message: 'خواهش می‌کنم! 🙏\nموفق باشید. منتظر تماس کارشناس ما باشید.',
          nextStep: 'FOLLOW_UP',
          sessionData: data,
        }
      }
      if (message === 'قیمت دزدگیرها') {
        return {
          message:
            'قیمت‌ها بستگی به مدل داره:\n• پکیج اقتصادی: از **۲.۵ میلیون تومان**\n• پکیج متوسط: از **۵ میلیون تومان**\n• پکیج هوشمند: از **۶ میلیون تومان**\n\nکارشناس ما قیمت دقیق رو بعد از بررسی محیط بهتون می‌گه.',
          nextStep: 'FOLLOW_UP',
          quickReplies: ['شرایط نصب', 'خیر، ممنون'],
          sessionData: data,
        }
      }
      if (message === 'شرایط نصب') {
        return {
          message:
            '🔧 **شرایط نصب بیواز:**\n• نصب رایگان در تهران و کرج\n• سایر شهرها با هزینه سفر\n• زمان نصب: ۲ تا ۴ ساعت\n• گارانتی ۱۸ ماهه روی تمام قطعات',
          nextStep: 'FOLLOW_UP',
          quickReplies: ['قیمت دزدگیرها', 'خیر، ممنون'],
          sessionData: data,
        }
      }
      return {
        message: 'سوال دیگه‌ای دارید؟ خوشحال می‌شم کمک کنم.',
        nextStep: 'FOLLOW_UP',
        quickReplies: ['قیمت دزدگیرها', 'شرایط نصب', 'خیر، ممنون'],
        sessionData: data,
      }
    }

    default:
      return {
        message: 'ببخشید، متوجه نشدم. می‌تونم به شکل دیگه‌ای کمک کنم؟',
        nextStep: 'FOLLOW_UP',
        quickReplies: ['شروع مجدد'],
        sessionData: data,
      }
  }
}

// ── Request Handler ──────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ChatRequest

    if (!body.step || body.message === undefined) {
      return NextResponse.json({ error: 'پارامترهای ناقص' }, { status: 400 })
    }

    // تأخیر مصنوعی برای حس واقعی‌تر (۶۰۰ تا ۱۲۰۰ میلی‌ثانیه)
    const delay = 600 + Math.random() * 600
    await new Promise((r) => setTimeout(r, delay))

    const response = getBotResponse(body)

    // اگر شماره گرفته شد — ذخیره lead را به فرانت‌اند اطلاع می‌دهیم
    // فرانت‌اند جداگانه به /api/leads درخواست می‌زند
    return NextResponse.json(response)
  } catch {
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}
