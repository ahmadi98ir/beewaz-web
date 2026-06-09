import { BentoCard } from './bento-card'

interface AnalyticsTileProps {
  conversionRatePct:   number
  abandonedCarts:      number
  abandonedToman:      number
  ordersThisMonth:     number
  paidOrders:          number
}

export function AnalyticsTile({
  conversionRatePct,
  abandonedCarts,
  ordersThisMonth,
  paidOrders,
}: AnalyticsTileProps) {
  const circumference = 2 * Math.PI * 22
  const progress = (conversionRatePct / 100) * circumference

  return (
    <BentoCard className="p-5 flex flex-col gap-4" glowColor="rgba(251,146,60,0.08)">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-accent-500/15 flex items-center justify-center">
          <svg className="w-4 h-4 text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <p className="text-white text-sm font-bold">تحلیل فروش</p>
      </div>

      {/* Conversion Rate Ring */}
      <div className="flex flex-col items-center gap-1">
        <div className="relative w-20 h-20">
          <svg className="w-20 h-20 -rotate-90" viewBox="0 0 52 52">
            <circle cx="26" cy="26" r="22" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
            <circle
              cx="26" cy="26" r="22"
              fill="none"
              stroke="#FB923C"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={`${progress} ${circumference}`}
              style={{ filter: 'drop-shadow(0 0 6px rgba(251,146,60,0.6))' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-white font-black text-base leading-none">
              {conversionRatePct.toLocaleString('fa-IR')}٪
            </span>
            <span className="text-white/30 text-[9px] mt-0.5">تبدیل</span>
          </div>
        </div>
        <p className="text-white/40 text-[10px]">نرخ تبدیل سفارش به پرداخت</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white/[0.04] rounded-xl p-3 text-center">
          <p className="text-white font-black text-lg">{ordersThisMonth.toLocaleString('fa-IR')}</p>
          <p className="text-white/40 text-[10px]">کل سفارشات</p>
        </div>
        <div className="bg-white/[0.04] rounded-xl p-3 text-center">
          <p className="text-emerald-400 font-black text-lg">{paidOrders.toLocaleString('fa-IR')}</p>
          <p className="text-white/40 text-[10px]">پرداخت‌شده</p>
        </div>
      </div>

      {/* Abandoned indicator */}
      {abandonedCarts > 0 && (
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/[0.08] border border-amber-500/20">
          <span className="text-amber-400 text-xs">سبد رها شده</span>
          <span className="text-amber-400 font-bold text-sm">{abandonedCarts.toLocaleString('fa-IR')}</span>
        </div>
      )}
    </BentoCard>
  )
}
