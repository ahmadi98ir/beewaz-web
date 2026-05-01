import type { Metadata } from 'next'
import { AnimateIn } from '@/components/ui/animate-in'
import { ShieldIcon, CheckIcon } from '@/components/ui/icons'

export const metadata: Metadata = {
  title: 'درباره بیواز',
  description: 'بیواز — بیش از ۶ سال تجربه در ارائه سیستم‌های دزدگیر و امنیتی اماکن تجاری و مسکونی',
}

const stats = [
  { value: '۱۵,۰۰۰+', label: 'مشتری راضی' },
  { value: '۶', label: 'سال تجربه' },
  { value: '۹۸٪', label: 'رضایت مشتری' },
  { value: '۲۴/۷', label: 'پشتیبانی' },
]

const values = [
  { icon: '🛡️', title: 'کیفیت بی‌타협', desc: 'هر محصول قبل از عرضه از ۱۲ مرحله کنترل کیفی می‌گذرد.' },
  { icon: '💡', title: 'نوآوری مستمر', desc: 'با به‌روزترین فناوری‌های روز دنیا، راهکارهای هوشمند ارائه می‌دهیم.' },
  { icon: '🤝', title: 'اعتماد متقابل', desc: 'شفافیت در قیمت‌گذاری، ضمانت اصالت کالا و خدمات پس از فروش.' },
  { icon: '🇮🇷', title: 'ساخت ایران', desc: 'افتخار می‌کنیم که محصولاتمان توسط متخصصان ایرانی طراحی می‌شوند.' },
]

const team = [
  { name: 'مهندس رضایی', role: 'مدیرعامل', initial: 'ر', from: '#EFF6FF', to: '#BFDBFE' },
  { name: 'مهندس کریمی', role: 'مدیر فنی', initial: 'ک', from: '#FFF1F1', to: '#FECACA' },
  { name: 'خانم احمدی', role: 'مدیر فروش', initial: 'ا', from: '#ECFDF5', to: '#A7F3D0' },
  { name: 'مهندس موسوی', role: 'سرپرست نصب', initial: 'م', from: '#FFF7ED', to: '#FED7AA' },
]

const certifications = [
  'استاندارد ملی ایران ISIRI',
  'گواهینامه CE اروپا',
  'تأییدیه پلیس پیشگیری ناجا',
  'عضو انجمن صنفی امنیت ایران',
]

export default function AboutPage() {
  return (
    <div className="min-h-screen">

      {/* Hero */}
      <section className="bg-gradient-to-br from-surface-900 via-surface-800 to-surface-900 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="absolute w-64 h-64 rounded-full border border-white"
              style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, transform: 'translate(-50%,-50%)' }} />
          ))}
        </div>
        <div className="container-main relative text-center">
          <AnimateIn>
            <div className="inline-flex w-16 h-16 rounded-2xl bg-brand-600/20 border border-brand-500/30 items-center justify-center mb-6">
              <ShieldIcon size={28} className="text-brand-400" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-black mb-4">درباره بیواز</h1>
            <p className="text-surface-300 max-w-2xl mx-auto text-lg leading-relaxed">
              از سال ۱۳۹۸، بیواز با هدف ارائه سیستم‌های امنیتی باکیفیت و قیمت منصفانه به ایرانیان فعالیت می‌کند.
            </p>
          </AnimateIn>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-brand-600 py-12">
        <div className="container-main">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-white text-center">
            {stats.map((s, i) => (
              <AnimateIn key={s.label} delay={i * 80}>
                <div>
                  <p className="text-3xl lg:text-4xl font-black mb-1">{s.value}</p>
                  <p className="text-white/70 text-sm">{s.label}</p>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="container-main py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <AnimateIn>
            <div>
              <p className="text-brand-600 font-bold text-sm mb-2">داستان ما</p>
              <h2 className="text-3xl font-black text-surface-900 mb-5">از یک ایده تا ۱۵ هزار مشتری</h2>
              <div className="space-y-4 text-surface-600 leading-relaxed">
                <p>
                  بیواز در سال ۱۳۹۸ با یک تیم ۵ نفره و یک هدف ساده شروع کرد: ارائه سیستم‌های امنیتی باکیفیت
                  که هر ایرانی بتواند از عهده خرید آن‌ها بربیاید.
                </p>
                <p>
                  امروز با تیمی بیش از ۵۰ نفر، بیش از ۱۵ هزار مشتری در سراسر ایران داریم. از آپارتمان‌های
                  کوچک تا مجتمع‌های تجاری بزرگ، راهکارهای ما در هر مقیاسی کار می‌کنند.
                </p>
                <p>
                  سری محصولات BW با استفاده از اجزای اروپایی و طراحی ایرانی، بهترین تعادل بین کیفیت و قیمت را
                  در بازار ایران ارائه می‌دهند.
                </p>
              </div>
            </div>
          </AnimateIn>

          <AnimateIn delay={100}>
            <div className="grid grid-cols-2 gap-4">
              {[
                { year: '۱۳۹۸', title: 'تأسیس', desc: 'شروع با ۵ نفر در تهران' },
                { year: '۱۳۹۹', title: 'رشد', desc: 'ورود به ۱۰ استان' },
                { year: '۱۴۰۱', title: 'توسعه', desc: 'راه‌اندازی فروش آنلاین' },
                { year: '۱۴۰۳', title: 'امروز', desc: '۱۵,۰۰۰+ مشتری راضی' },
              ].map((item) => (
                <div key={item.year} className="bg-surface-50 rounded-2xl p-5 border border-surface-200">
                  <p className="text-brand-600 font-black text-xl mb-1">{item.year}</p>
                  <p className="font-bold text-surface-900 text-sm">{item.title}</p>
                  <p className="text-surface-500 text-xs mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* Values */}
      <section className="bg-surface-50 py-16">
        <div className="container-main">
          <AnimateIn>
            <div className="text-center mb-10">
              <h2 className="text-2xl font-black text-surface-900">ارزش‌های ما</h2>
              <p className="text-surface-500 mt-2">اصولی که هر روز راهنمای کار ما هستند</p>
            </div>
          </AnimateIn>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map((v, i) => (
              <AnimateIn key={v.title} delay={i * 70}>
                <div className="bg-white rounded-2xl border border-surface-200 p-6 text-center hover:shadow-md transition-shadow">
                  <div className="text-4xl mb-4">{v.icon}</div>
                  <h3 className="font-bold text-surface-900 mb-2">{v.title}</h3>
                  <p className="text-sm text-surface-500 leading-relaxed">{v.desc}</p>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="container-main py-16">
        <AnimateIn>
          <div className="text-center mb-10">
            <h2 className="text-2xl font-black text-surface-900">تیم ما</h2>
            <p className="text-surface-500 mt-2">افرادی که امنیت خانه شما را تضمین می‌کنند</p>
          </div>
        </AnimateIn>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {team.map((member, i) => (
            <AnimateIn key={member.name} delay={i * 70}>
              <div className="bg-white rounded-2xl border border-surface-200 p-6 text-center hover:shadow-md transition-shadow">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-black text-surface-600"
                  style={{ background: `linear-gradient(135deg, ${member.from}, ${member.to})` }}
                >
                  {member.initial}
                </div>
                <h3 className="font-bold text-surface-900">{member.name}</h3>
                <p className="text-sm text-surface-400 mt-1">{member.role}</p>
              </div>
            </AnimateIn>
          ))}
        </div>
      </section>

      {/* Certifications */}
      <section className="bg-surface-900 text-white py-12">
        <div className="container-main">
          <AnimateIn>
            <div className="text-center mb-8">
              <h2 className="text-xl font-black">گواهینامه‌ها و تأییدیه‌ها</h2>
            </div>
          </AnimateIn>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {certifications.map((cert, i) => (
              <AnimateIn key={cert} delay={i * 60}>
                <div className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3">
                  <CheckIcon size={16} className="text-green-400 flex-shrink-0" />
                  <span className="text-sm text-white/80">{cert}</span>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
