import Link from 'next/link'
import { prisma } from '@/lib/db'
import { RequestStatusBadge } from './status-badge'

export const dynamic = 'force-dynamic'

const dollars = (cents: number) => `$${(cents / 100).toFixed(2)}`
const when = (d: Date | null) =>
  d ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'America/Chicago' }).format(d) : '—'

/**
 * Guests who bought at the member rate and asked to be verified. Open requests
 * first; the admin layout's sign-in gate applies.
 */
export default async function MemberRateRequestsPage() {
  const requests = await prisma.memberRateRequest.findMany({
    where: { status: { not: 'AWAITING_PAYMENT' } },
    orderBy: [{ createdAt: 'desc' }],
    take: 200,
    include: {
      registration: { select: { name: true, email: true, company: true, ticketCount: true, event: { select: { title: true } } } },
      decidedBy: { select: { firstName: true, lastName: true, email: true } },
    },
  })
  const open = requests.filter(r => r.status === 'PENDING')
  const done = requests.filter(r => r.status !== 'PENDING')

  const Row = ({ r }: { r: (typeof requests)[number] }) => (
    <Link href={`/admin/member-rate-requests/${r.id}`} className="block rounded-lg border bg-white p-4 hover:border-blue-300 hover:shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-gray-900">{r.registration.name}{r.registration.company ? <span className="font-normal text-gray-600"> · {r.registration.company}</span> : null}</p>
          <p className="text-sm text-gray-600 break-all">{r.registration.email}</p>
          <p className="text-sm text-gray-700 mt-1">{r.registration.event.title} · {r.registration.ticketCount} ticket{r.registration.ticketCount === 1 ? '' : 's'}</p>
        </div>
        <div className="text-right space-y-1">
          <RequestStatusBadge status={r.status} />
          <p className="text-xs text-gray-600">
            {r.status === 'PENDING'
              ? `${dollars(r.memberCents)} if verified · ${dollars(r.heldCents)} if not · decide by ${when(r.deadlineAt)}`
              : `Charged ${dollars(r.chargedCents ?? 0)}${r.decidedBy ? ` · ${r.decidedBy.firstName ?? r.decidedBy.email}` : ''} · ${when(r.decidedAt)}`}
          </p>
        </div>
      </div>
    </Link>
  )

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Member rate requests</h1>
        <p className="text-sm text-gray-600 mt-1">
          People who bought at the member rate without signing in as a member. Their card is on hold for the
          non-member price until you decide. Undecided requests are charged the non-member rate at the deadline.
        </p>
      </div>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">Needs a decision ({open.length})</h2>
        {open.length ? open.map(r => <Row key={r.id} r={r} />) : <p className="text-sm text-gray-600">Nothing waiting.</p>}
      </section>
      {done.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Decided</h2>
          {done.map(r => <Row key={r.id} r={r} />)}
        </section>
      )}
    </div>
  )
}
