import Link from 'next/link'
import { AnimateIn } from '@/components/ui/animate-in'
import { PhoneIcon, ShieldIcon } from '@/components/ui/icons'

export function CtaSection() {
  return (
    <section className="py-16 lg:py-24 overflow-hidden" aria-label="فراخوان عمل">
      <div className="container-main">
        <AnimateIn>
          <div className="relative rounded-3xl overflow-hidden bg-surface-900 p-10 lg:p-16">

            {/* Background pattern */}
            <div
              className="absolute inset-0 opacity-10"
              aria-hidden="true"
              style={{
                backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                backgroundSize: '28px 28px',
              }}
            />

            {/* Glow */}
            <div className="absolute -top-20 -end-20 w-80 h-80 rounded-full opacity-25 pointer-events-none"
              style={{ background: 'radial-gradient(circle, #F97316, transparent 70%)' }}
            />
            <div className="absolute -bottom-20 -start-20 w-64 h-64 rounded-full opacity-20 pointer-events-none"
              style={{ background: 'radial-gradient(circle, #3B5CEF, transparent 70%)' }}
            />

            <div className="relative z-10 grid lg:grid-cols-2 gap-10 items-center">

              {/* متن */}
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold"
                  style={{ background: 'rgb(249 115 22 / 0.15)', borderColor: 'rgb(249 115 22 / 0.4)', color: '#FDBA74' }}>
                  <span className="w-2 h-2 rounded-full bg-accent-400 animate-pulse" />
                  مشاوره کاملاً رایگان
                </div>

                <h2 className="text-3xl lg:text-4xl font-black text-white leading-tight">
                  نمی‌دانید چه دزدگیری
                  <br />
                  <span className="animate-shimmer-text text-gradient-brand">برای شما مناسب است؟</span>
                </h2>

                <p className="text-white/60 leading-relaxed max-w-md">
                  کارشناسان بیواز آماده‌اند تا بر اساس متراژ، کاربری و بودجه شما،
                  بهترین سیستم امنیتی را پیشنهاد دهند.
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/contact"
                    className="btn btn-accent px-8 py-3.5 text-base shadow-lg orange-glow"
                  >
                    دریافت مشاوره رایگان
                  </Link>
                  <a
                    href="tel:+982100000000"
                    className="btn border border-white/20 text-white hover:bg-white/10 px-8 py-3.5 text-base gap-2 transition-colors"
                  >
                    <PhoneIcon size={18} />
                    تماس مستقیم
                  </a>
                </div>
              </div>

              {/* آمار سمت راست */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: '۱۵,۰۰۰+', label: 'مشتری راضی', sub: 'در سراسر ایران', accent: true },
                  { value: '۱۸ ماه', label: 'گارانتی رسمی', sub: 'برای تمام محصولات', accent: false },
                  { value: '۲۴/۷', label: 'پشتیبانی', sub: 'همیشه در دسترس', accent: false },
                  { value: '۱۰+', label: 'سال تجربه', sub: 'در صنعت امنیت', accent: true },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                    style={item.accent
                      ? { background: 'rgb(249 115 22 / 0.12)', borderColor: 'rgb(249 115 22 / 0.3)' }
                      : { background: 'rgb(255 255 255 / 0.06)', borderColor: 'rgb(255 255 255 / 0.1)' }}
                  >
                    <div className="text-2xl font-black mb-1"
                      style={{ color: item.accent ? '#FB923C' : '#ffffff' }}>
                      {item.value}
                    </div>
                    <div className="text-sm font-semibold text-white/80">{item.label}</div>
                    <div className="text-xs text-white/40 mt-0.5">{item.sub}</div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </AnimateIn>
      </div>
    </section>
  )
}
