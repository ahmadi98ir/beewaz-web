import type { ReturnStatus } from '@/lib/db/schema'

export const RETURN_STATUS_LABELS: Record<ReturnStatus, string> = {
  pending:  'در انتظار بررسی',
  approved: 'تأیید شده',
  rejected: 'رد شده',
  refunded: 'بازپرداخت شده',
}
