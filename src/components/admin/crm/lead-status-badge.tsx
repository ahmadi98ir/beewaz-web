import type { LeadStatus } from '@/lib/db/schema'

interface LeadStatusBadgeProps {
  status: LeadStatus
  size?: 'sm' | 'md'
}

const STATUS_CONFIG: Record<LeadStatus, { label: string; cls: string; dot: string }> = {
  new:           { label: 'جدید',           cls: 'bg-blue-50 text-blue-700 border-blue-200',       dot: 'bg-blue-400' },
  contacted:     { label: 'تماس گرفته',    cls: 'bg-amber-50 text-amber-700 border-amber-200',     dot: 'bg-amber-400' },
  qualified:     { label: 'واجد شرایط',    cls: 'bg-sky-50 text-sky-700 border-sky-200',           dot: 'bg-sky-400' },
  proposal_sent: { label: 'پیشنهاد ارسال', cls: 'bg-violet-50 text-violet-700 border-violet-200',  dot: 'bg-violet-400' },
  won:           { label: 'موفق',           cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-400' },
  converted:     { label: 'تبدیل شده',     cls: 'bg-green-50 text-green-700 border-green-200',     dot: 'bg-green-400' },
  lost:          { label: 'از دست رفته',   cls: 'bg-red-50 text-red-600 border-red-200',           dot: 'bg-red-400' },
}

export function LeadStatusBadge({ status, size = 'md' }: LeadStatusBadgeProps) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.new
  const px  = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-lg font-semibold border ${cfg.cls} ${px}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

export { STATUS_CONFIG }
export type { LeadStatus }
