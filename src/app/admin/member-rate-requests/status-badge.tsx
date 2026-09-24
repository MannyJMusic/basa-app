import { Badge } from '@/components/ui/badge'

const STYLES: Record<string, { label: string; className: string }> = {
  AWAITING_PAYMENT: { label: 'Checkout not finished', className: 'bg-gray-100 text-gray-700' },
  PENDING: { label: 'Needs a decision', className: 'bg-amber-100 text-amber-900' },
  APPROVED: { label: 'Approved (member rate)', className: 'bg-green-100 text-green-800' },
  DENIED: { label: 'Denied (non-member rate)', className: 'bg-red-100 text-red-800' },
  EXPIRED: { label: 'Expired (non-member rate)', className: 'bg-orange-100 text-orange-900' },
  CANCELLED: { label: 'Cancelled (nothing charged)', className: 'bg-gray-100 text-gray-600' },
}

export function RequestStatusBadge({ status }: { status: string }) {
  const s = STYLES[status] ?? { label: status, className: '' }
  return <Badge className={s.className}>{s.label}</Badge>
}
