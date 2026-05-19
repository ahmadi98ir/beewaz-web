import type { CmsContent } from '@/lib/cms'
import { AnimateIn } from '@/components/ui/animate-in'

interface Step { icon: string; title: string; desc: string }
const DEFAULT_STEPS: Step[] = [
  { icon: '📞', title: 'مشاوره رایگان',  desc: 'با کارشناسان ما تماس بگیرید تا بهترین راهکار را پیشنهاد دهیم' },
  { icon: '🎯', title: 'انتخاب محصول',  desc: 'بهترین دزدگیر برای فضا و بودجه شما را انتخاب می‌کنیم' },
  { icon: '🔧', title: 'نصب تخصصی',    desc: 'تیم فنی ما در محل شما نصب حرفه‌ای انجام می‌دهد' },
  { icon: '🛡️', title: 'پشتیبانی دائمی', desc: 'گارانتی ۱۸ ماهه و پشتیبانی ۲۴ ساعته در ۷ روز هفته' },
]

interface Props { cms?: CmsContent }

export function HowItWorks({ cms = {} }: Props) {
  const title    = cms.how_title    ?? '۴ گام تا امنیت کامل'
  const subtitle = cms.how_subtitle ?? 'از تماس اولیه تا پشتیبانی دائمی، همه‌جا کنارتان هستیم'
  let steps = DEFAULT_STEPS
  if (cms.how_steps) {
    try { const p = JSON.parse(cms.how_steps) as Step[]; if (Array.isArray(p) && p.length > 0) steps = p } catch {}
  }

  return (
    <section className="py-16 sm:py-24 bg-surface-50">
      <div className="container-page">
        <AnimateIn direction="up" className="text-center mb-14">
          <div className="orange-divider mx-auto mb-4" />
          <h2 className="text-2xl sm:text-4xl font-black text-surface-900 mb-3">{title}</h2>
          <p className="text-surface-500 text-lg max-w-xl mx-auto">{subtitle}</p>
        </AnimateIn>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <AnimateIn key={i} direction="up" delay={i * 120}>
              <div className="relative bg-white rounded-2xl p-7 border border-surface-100 text-center group transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-11 -end-3 w-6 h-0.5 bg-surface-200 z-10" />
                )}
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-brand-100 text-brand-700 text-sm font-black mb-5 ring-4 ring-brand-50">
                  {(i + 1).toLocaleString('fa-IR')}
                </span>
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-200">{step.icon}</div>
                <h3 className="font-bold text-surface-900 mb-2 text-base">{step.title}</h3>
                <p className="text-sm text-surface-500 leading-relaxed">{step.desc}</p>
                <div className="mt-4 mx-auto w-8 h-0.5 rounded-full bg-accent-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  )
}
