import Link from 'next/link'
import { BeewazLogo } from '@/components/ui/logo'
import {
  PhoneIcon,
  MailIcon,
  MapPinIcon,
  InstagramIcon,
  TelegramIcon,
  WhatsAppIcon,
  ShieldIcon,
  CheckIcon,
} from '@/components/ui/icons'
import { footerLinks } from '@/config/navigation'

// Server Component — بدون 'use client' → سریع‌ترین رندر ممکن

const trustSignals = [
  { icon: ShieldIcon, label: 'گارانتی اصالت کالا' },
  { icon: CheckIcon, label: 'ضمانت بازگشت وجه' },
  { icon: ShieldIcon, label: 'درگاه پرداخت امن' },
  { icon: CheckIcon, label: 'پشتیبانی ۲۴/۷' },
]

const socialLinks = [
  { icon: InstagramIcon, href: 'https://instagram.com/beewaz', label: 'اینستاگرام' },
  { icon: TelegramIcon, href: 'https://t.me/beewaz', label: 'تلگرام' },
  { icon: WhatsAppIcon, href: 'https://wa.me/989000000000', label: 'واتساپ' },
]

export function Footer() {
  const currentYear = new Date().getFullYear()
  const persianYear = currentYear - 621  // تبدیل به سال شمسی تقریبی

  return (
    <footer className="bg-surface-900 text-white" aria-label="فوتر سایت">

      {/* ── Trust Bar ────────────────────────────────────────────────────────── */}
      <div className="border-b border-white/10">
        <div className="container-main py-6">
          <ul className="grid grid-cols-2 sm:grid-cols-4 gap-4" role="list">
            {trustSignals.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-brand-600/20 flex items-center justify-center">
                  <Icon size={18} className="text-brand-400" />
                </div>
                <span className="text-sm font-medium text-white/80">{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Main Footer ───────────────────────────────────────────────────────── */}
      <div className="container-main py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">

          {/* ستون ۱ — برند و تماس */}
          <div className="sm:col-span-2 lg:col-span-1 space-y-6">
            <BeewazLogo variant="light" size="md" />

            <p className="text-sm text-white/60 leading-relaxed max-w-xs">
              بیواز — ارائه‌دهنده سیستم‌های حفاظتی و دزدگیر اماکن تجاری و مسکونی.
              محصولات استاندارد، نصب حرفه‌ای و پشتیبانی پس از فروش.
            </p>

            {/* اطلاعات تماس */}
            <address className="not-italic space-y-3">
              <a
                href="tel:+982100000000"
                className="flex items-center gap-3 text-sm text-white/70 hover:text-white transition-colors group"
              >
                <PhoneIcon size={15} className="text-brand-400 flex-shrink-0 group-hover:text-brand-300 transition-colors" />
                <span dir="ltr">۰۲۱-۰۰۰۰-۰۰۰۰</span>
              </a>
              <a
                href="mailto:info@beewaz.ir"
                className="flex items-center gap-3 text-sm text-white/70 hover:text-white transition-colors group"
              >
                <MailIcon size={15} className="text-brand-400 flex-shrink-0 group-hover:text-brand-300 transition-colors" />
                <span dir="ltr">info@beewaz.ir</span>
              </a>
              <div className="flex items-start gap-3 text-sm text-white/70">
                <MapPinIcon size={15} className="text-brand-400 flex-shrink-0 mt-0.5" />
                <span>تهران، ایران</span>
              </div>
            </address>

            {/* شبکه‌های اجتماعی */}
            <div className="flex items-center gap-2">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center hover:bg-brand-600 transition-colors duration-200"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* ستون ۲ — فروشگاه */}
          <div>
            <h3 className="text-sm font-bold text-white mb-5 pb-3 border-b border-white/10">
              فروشگاه
            </h3>
            <ul className="space-y-3" role="list">
              {footerLinks.shop.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-white/60 hover:text-white transition-colors hover:translate-x-0.5 inline-flex items-center gap-1.5 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-brand-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ستون ۳ — دانش */}
          <div>
            <h3 className="text-sm font-bold text-white mb-5 pb-3 border-b border-white/10">
              پایگاه دانش
            </h3>
            <ul className="space-y-3" role="list">
              {footerLinks.knowledge.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-white/60 hover:text-white transition-colors hover:translate-x-0.5 inline-flex items-center gap-1.5 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-brand-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ستون ۴ — شرکت */}
          <div>
            <h3 className="text-sm font-bold text-white mb-5 pb-3 border-b border-white/10">
              شرکت
            </h3>
            <ul className="space-y-3" role="list">
              {footerLinks.company.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-white/60 hover:text-white transition-colors hover:translate-x-0.5 inline-flex items-center gap-1.5 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-brand-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* خبرنامه */}
            <div className="mt-8">
              <p className="text-xs text-white/50 mb-3">دریافت آخرین اخبار و تخفیف‌ها:</p>
              <form
                className="flex gap-2"
                onSubmit={(e) => e.preventDefault()}
                aria-label="عضویت در خبرنامه"
              >
                <input
                  type="tel"
                  placeholder="شماره موبایل"
                  className="flex-1 min-w-0 px-3 py-2 text-sm rounded-lg bg-white/10 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-brand-500 focus:bg-white/15 transition-colors"
                  dir="ltr"
                />
                <button
                  type="submit"
                  className="flex-shrink-0 px-3 py-2 text-xs font-semibold rounded-lg bg-brand-600 hover:bg-brand-700 transition-colors"
                >
                  عضو شو
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>

      {/* ── Bottom Bar ────────────────────────────────────────────────────────── */}
      <div className="border-t border-white/10">
        <div className="container-main py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <p>
            © {persianYear} — {currentYear} بیواز. تمامی حقوق محفوظ است.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-white/70 transition-colors">
              حریم خصوصی
            </Link>
            <Link href="/terms" className="hover:text-white/70 transition-colors">
              شرایط استفاده
            </Link>
            <span className="text-white/20">|</span>
            <span>ساخته شده با ❤️ در ایران</span>
          </div>
        </div>
      </div>

    </footer>
  )
}
