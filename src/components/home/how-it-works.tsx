import type { CmsContent } from '@/lib/cms'

interface Step {
  icon: string
  title: string
  desc: string
}

const DEFAULT_STEPS: Step[] = [
  { icon: '📞', title: 'مشاوره رایگان',  desc: 'با کارشناسان ما تماس بگیرید تا بهترین راهکار را پیشنهاد دهیم' },
  { icon: '🎯', title: 'انتخاب محصول',  desc: 'بهترین دزدگیر برای فضا و بودجه شما را انتخاب می‌کنیم' },
  { icon: '🔧', title: 'نصب تخصصی',    desc: 'تیم فنی ما در محل شما نصب حرفه‌ای انجام می‌دهد' },
  { icon: '🛡️', title: 'پشتیبانی دائمی', desc: 'گارانتی ۱۸ ماهه و پشتیبانی ۲۴ ساعته در ۷ روز هفته' },
]

interface HowItWorksProps {
  cms?: CmsContent
}

export function HowItWorks({ cms = {} }: HowItWorksProps) {
  const title    = cms.how_title    ?? '۴ گام تا امنیت کامل'
  const subtitle = cms.how_subtitle ?? 'از تماس اولیه تا پشتیبانی دائمی، همه‌جا کنارتان هستیم'

  let steps = DEFAULT_STEPS
  if (cms.how_steps) {
    try {
      const parsed = JSON.parse(cms.how_steps) as Step[]
      if (Array.isArray(parsed) && parsed.length > 0) steps = parsed
    } catch {
      // parse failed — use defaults
    }
  }

  return (
    <section className="py-16 sm:py-24 bg-surface-50">
      <div className="container-page">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-4xl font-black text-surface-900 mb-3">{title}</h2>
          <p className="text-surface-500 text-lg max-w-xl mx-auto">{subtitle}</p>
        </div>

        {/* Steps */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div key={i} className="relative bg-white rounded-2xl p-6 shadow-sm border border-surface-100 hover:shadow-md transition-shadow text-center group">
              {/* Connector line (hidden on last) */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 -end-3 w-6 h-0.5 bg-surface-200 z-10" />
              )}
              {/* Step number */}
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-brand-100 text-brand-700 text-sm font-bold mb-4">
                {(i + 1).toLocaleString('fa-IR')}
              </span>
              {/* Icon */}
              <div className="text-4xl mb-3">{step.icon}</div>
              <h3 className="font-bold text-surface-900 mb-2">{step.title}</h3>
              <p className="text-sm text-surface-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
