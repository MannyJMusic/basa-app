import Link from 'next/link'
import { notFound } from 'next/navigation'
import { formatEventWhen, loadTicket, ticketAttendees } from '@/lib/tickets'
import { CheckInButton } from './check-in-button'

export const dynamic = 'force-dynamic'

/**
 * What the door sees when it scans a ticket's QR code (#159). Lives under /admin,
 * so the admin layout's sign-in gate applies: a guest scanning their own ticket
 * gets the sign-in page, not this. Shows who it is, what they bought, whether the
 * payment actually completed, and one button.
 */
export default async function CheckInPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const t = await loadTicket(token)
  if (!t) notFound()

  const when = formatEventWhen(t.event.startDate, t.event.endDate)
  const attendees = ticketAttendees(t)
  const ok = t.status === 'CONFIRMED'

  return (
    <div className="mx-auto max-w-lg p-4 sm:p-8">
      <p className="text-xs uppercase tracking-widest text-gray-500">Check-in</p>
      <h1 className="mt-1 text-2xl font-bold text-gray-900">{t.event.title}</h1>
      <p className="text-sm text-gray-600">{when.date} · {when.time}</p>

      <div className={`mt-6 rounded-2xl border p-5 ${ok ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
        <div className="text-2xl font-bold text-gray-900">{t.name}</div>
        {t.company && <div className="text-gray-700">{t.company}</div>}
        <div className="text-sm text-gray-600">{t.email}{t.phone ? ` · ${t.phone}` : ''}</div>

        <div className="mt-4 text-sm text-gray-800">
          {t.items.map((i) => (
            <div key={i.id}><span className="font-semibold">{i.quantity} ×</span> {i.ticketTier.name}</div>
          ))}
          <div className="mt-1 text-gray-600">{t.ticketCount} ticket{t.ticketCount === 1 ? '' : 's'} · ${Number(t.totalAmount).toFixed(2)}</div>
        </div>

        {attendees.length > 0 && (
          <div className="mt-4 text-sm">
            <div className="text-gray-500">Attendees</div>
            <ul className="text-gray-900">{attendees.map((a, i) => <li key={i}>{a.name}</li>)}</ul>
          </div>
        )}

        <div className="mt-5">
          {ok ? (
            <CheckInButton registrationId={t.id} checkedInAt={t.checkedInAt?.toISOString() ?? null} checkedInBy={t.checkedInBy} />
          ) : (
            <div className="rounded-lg bg-white/70 p-3 text-sm text-red-900">
              <strong>Do not admit on this ticket.</strong> Payment status: {t.status.toLowerCase()}.
              {t.status === 'PENDING' ? ' The card was never charged; the guest can pay at the desk or retry online.' : ''}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex gap-4 text-sm">
        <Link href={`/tickets/${token}`} className="text-blue-700 underline">Open the ticket</Link>
        <Link href="/admin/events" className="text-blue-700 underline">All events</Link>
      </div>
    </div>
  )
}
