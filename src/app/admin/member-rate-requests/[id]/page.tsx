import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { prisma } from '@/lib/db'
import { RequestStatusBadge } from '../status-badge'
import { DecisionButtons } from '../decision-buttons'

export const dynamic = 'force-dynamic'

const dollars = (cents: number) => `$${(cents / 100).toFixed(2)}`
const when = (d: Date | null) =>
  d ? new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'America/Chicago' }).format(d) : '—'

/** Where the admin email's button lands. Behind the admin layout's sign-in gate. */
export default async function MemberRateRequestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const r = await prisma.memberRateRequest.findUnique({
    where: { id },
    include: {
      registration: {
        include: {
          event: { select: { title: true, startDate: true } },
          items: { include: { ticketTier: { select: { name: true } } } },
        },
      },
      decidedBy: { select: { firstName: true, lastName: true, email: true } },
    },
  })
  if (!r) notFound()
  const reg = r.registration

  // Anyone already on file under this email: the quickest way to verify.
  const onFile = await prisma.user.findFirst({
    where: { email: { equals: reg.email, mode: 'insensitive' } },
    select: { firstName: true, lastName: true, role: true, member: { select: { membershipStatus: true, businessName: true } } },
  })

  const field = (label: string, value: React.ReactNode) => (
    <div className="grid grid-cols-3 gap-2 py-1.5 text-sm"><dt className="text-gray-500">{label}</dt><dd className="col-span-2 text-gray-900 wrap-break-word">{value}</dd></div>
  )

  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-8 space-y-6">
      <Link href="/admin/member-rate-requests" className="inline-flex items-center text-sm text-blue-800 hover:underline">
        <ArrowLeft className="mr-1 h-4 w-4" /> All requests
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold text-gray-900">Is {reg.name} a member?</h1>
        <RequestStatusBadge status={r.status} />
      </div>

      <dl className="rounded-lg border bg-white p-4 divide-y">
        {field('Name', reg.name)}
        {field('Email', reg.email)}
        {reg.company && field('Company', reg.company)}
        {reg.phone && field('Phone', reg.phone)}
        {field('Event', `${reg.event.title} (${when(reg.event.startDate)})`)}
        {field('Tickets', reg.items.map(i => `${i.quantity} × ${i.ticketTier.name}`).join(', '))}
        {field('On file', onFile
          ? `${[onFile.firstName, onFile.lastName].filter(Boolean).join(' ') || 'An account'} · ${onFile.member ? `membership ${onFile.member.membershipStatus.toLowerCase()}${onFile.member.businessName ? ` (${onFile.member.businessName})` : ''}` : `no membership record (${onFile.role.toLowerCase()})`}`
          : 'No account with this email')}
        {field('Requested', when(r.authorizedAt ?? r.createdAt))}
      </dl>

      {r.status === 'PENDING' ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-3">
          <p className="text-sm text-gray-800">
            The card is on hold for <strong>{dollars(r.heldCents)}</strong>. If they are a member, approve and we charge only{' '}
            <strong>{dollars(r.memberCents)}</strong>; the rest of the hold is released. If not, deny and we charge{' '}
            <strong>{dollars(r.heldCents)}</strong>. With no decision by <strong>{when(r.deadlineAt)}</strong> the non-member
            rate is charged automatically. The buyer is emailed either way.
          </p>
          <DecisionButtons
            requestId={r.id}
            memberCents={r.memberCents}
            heldCents={r.heldCents}
            buyerName={reg.name}
            alreadyMember={onFile?.member?.membershipStatus === 'ACTIVE'}
          />
        </div>
      ) : (
        <div className="rounded-lg border bg-white p-4 text-sm text-gray-800 space-y-1">
          {r.chargedCents !== null && <p>Charged <strong>{dollars(r.chargedCents)}</strong>.</p>}
          {r.decidedAt && <p>Decided {when(r.decidedAt)}{r.decidedBy ? ` by ${[r.decidedBy.firstName, r.decidedBy.lastName].filter(Boolean).join(' ') || r.decidedBy.email}` : ' automatically at the deadline'}.</p>}
          {r.decisionNote && <p>Note: {r.decisionNote}</p>}
          {r.status === 'AWAITING_PAYMENT' && <p>The buyer has not finished checkout; there is nothing to decide yet.</p>}
          {r.status === 'CANCELLED' && <p>The checkout was abandoned or the payment failed. Nothing was charged.</p>}
        </div>
      )}
    </div>
  )
}
