import { AnimateIn } from '@/components/ui/animate-in'

const steps = [
  {
    step: '۱',
    title: 'مشاوره رایگان',
    desc: 'با کارشناسان ما تماس بگیرید یا از چت‌بات هوشمند بپرسید. نیازتان را بشنویم و بهترین گزینه را پیشنهاد دهیم.',
    color: 'bg-blue-50 text-blue-600 border-blue-100',
    dotColor: 'bg-blue-500',
  },
  {
    step: '۲',
    title: 'انتخاب و سفارش',
    desc: 'محصول مناسب را از فروشگاه انتخاب کنید. پرداخت امن آنلاین، تحویل سریع به سراسر ایران.',
    color: 'bg-brand-50 text-brand-600 border-brand-100',
    dotColor: 'bg-brand-500',
  },
  {
    step: '۳',
    title: 'نصب حرفه‌ای',
    desc: 'تکنیسین‌های مجرب ما دزدگیر را نصب و راه‌اندازی می‌کنند. آموزش استفاده ارائه می‌شود.',
    color: 'bg-green-50 text-green-600 border-green-100',
    dotColor: 'bg-green-500',
  },
  {
    step: '۴',
    title: 'پشتیبانی همیشگی',
    desc: 'تیم پشتیبانی ۲۴ ساعته در کنار شماست. گارانتی ۱۸ ماهه و خدمات پس از فروش.',
    color: 'bg-purple-50 text-purple-600 border-purple-100',
    dotColor: 'bg-purple-500',
  },
]

export function HowItWorks() {
  return (
    <section className="py-16 lg:py-24 bg-surface-50" aria-label="نحوه خرید">
      <div className="container-main">

        {/* Header */}
        <AnimateIn className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-200/60 text-surface-700 text-sm font-semibold mb-4">
            فرایند خرید
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-surface-900 mb-3">
            ۴ گام تا امنیت کامل
          </h2>
          <p className="text-surface-500 max-w-lg mx-auto">
            از مشاوره تا نصب — همه چیز را به بیواز بسپارید
          </p>
        </AnimateIn>

        {/* Steps */}
        <div className="relative">
          {/* خط اتصال‌دهنده — دسکتاپ */}
          <div className="hidden lg:block absolute top-10 inset-x-0 h-0.5 bg-surface-200 mx-[12.5%]" aria-hidden="true">
            <div className="h-full bg-gradient-to-l from-purple-300 via-green-300 via-brand-300 to-blue-300" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((s, i) => (
              <AnimateIn key={s.step} delay={i * 100}>
                <div className="relative flex flex-col items-center text-center lg:items-start lg:text-start">
                  {/* شماره مرحله */}
                  <div className={`w-20 h-20 rounded-2xl border-2 flex items-center justify-center mb-5 text-3xl font-black ${s.color} relative z-10 bg-white shadow-sm`}>
                    {s.step}
                    {/* نقطه اتصال */}
                    <span className={`absolute -bottom-1 -end-1 w-3 h-3 rounded-full ${s.dotColor} border-2 border-white`} />
                  </div>

                  <h3 className="text-lg font-bold text-surface-900 mb-2">{s.title}</h3>
                  <p className="text-sm text-surface-500 leading-relaxed">{s.desc}</p>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
