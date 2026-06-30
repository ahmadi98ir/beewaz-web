/**
 * تازه‌های نسخه — تاریخچه تغییرات قابل‌نمایش در پنل ادمین
 * هر آپدیت مهم باید یک ورودی جدید اینجا اضافه کند (دستی، نه از DB)
 */

export type ChangelogEntryType = 'feature' | 'fix' | 'improvement'

export interface ChangelogEntry {
  type: ChangelogEntryType
  text: string
}

export interface ChangelogRelease {
  version: string
  date: string
  entries: ChangelogEntry[]
}

export const CHANGELOG: ChangelogRelease[] = [
  {
    version: '0.4.0',
    date: '۱۴۰۵/۰۴/۰۹',
    entries: [
      { type: 'feature', text: 'قابلیت PWA — امکان نصب بیواز روی صفحهٔ اصلی موبایل با آیکون و نام اختصاصی' },
      { type: 'feature', text: 'دفترچه آدرس چندتایی در پروفایل — افزودن، ویرایش، حذف و تعیین آدرس پیش‌فرض؛ انتخاب مستقیم آدرس ذخیره‌شده هنگام تکمیل خرید' },
      { type: 'improvement', text: 'گسترش جستجوی محصولات از نام به نام، کد SKU/مدل و نام دسته‌بندی' },
    ],
  },
  {
    version: '0.3.0',
    date: '۱۴۰۵/۰۴/۰۱',
    entries: [
      { type: 'fix', text: 'رفع باگ عدم ثبت آمار روزانه — جدول گزارش بازدید با cron روزانه به‌درستی پر می‌شود' },
      { type: 'feature', text: 'یادآوری خودکار سبد خرید رهاشده با پیامک (cron روزانه)' },
      { type: 'feature', text: 'قابلیت علاقه‌مندی‌ها (Wishlist) با همگام‌سازی بین مرورگر و حساب کاربری' },
      { type: 'feature', text: 'ویرایشگر متن غنی برای مقالات، صفحات و محتوای سایت + افزودن صفحات «درباره ما»، «حریم خصوصی» و «شرایط استفاده» به بخش مدیریت محتوا' },
    ],
  },
  {
    version: '0.2.0',
    date: '۱۴۰۵/۰۳/۳۰',
    entries: [
      { type: 'feature', text: 'بخش لاگ پیامک‌ها فعال شد — همه پیامک‌های ارسالی (سفارش، OTP، اطلاع‌رسانی ادمین، تغییر وضعیت، استرداد، لید جدید) ثبت می‌شوند' },
      { type: 'feature', text: 'افزودن بخش «تازه‌های نسخه» به منوی پنل مدیریت' },
      { type: 'improvement', text: 'هر بیلد دیپلوی‌شده اکنون شماره نسخه و شناسه commit مشخصی دارد' },
    ],
  },
  {
    version: '0.1.2',
    date: '۱۴۰۵/۰۳/۲۸',
    entries: [
      { type: 'fix', text: 'رفع باگ «داده‌ها بارگذاری نشد» در داشبورد آمار بازدید — اکنون هر بخش به‌صورت مجزا بارگذاری می‌شود' },
    ],
  },
  {
    version: '0.1.1',
    date: '۱۴۰۵/۰۳/۲۵',
    entries: [
      { type: 'feature', text: 'داشبورد آمار بازدید حرفه‌ای‌تر شد — تفکیک روزانه، مرورگر، سیستم‌عامل، منبع ورودی و الگوی ساعتی ترافیک' },
      { type: 'feature', text: 'اتصال گوگل آنالیتکس (GA4) از پنل مدیریت' },
    ],
  },
]
