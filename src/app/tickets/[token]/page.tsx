import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CalendarDays, MapPin, Ticket as TicketIcon } from 'lucide-react'
import { formatEventWhen, formatEventWhere, loadTicket, ticketAttendees, ticketQrSvg } from '@/lib/tickets'
import { PrintTicketButton } from './print-button'

export const dynamic = 'force-dynamic'

/**
 * The ticket (#159). Reached from the confirmation email and the payment success
 * page; identified only by its random token. Prints to one page and screenshots
 * cleanly: the QR code opens the admin check-in page for this registration.
 */
export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const { token } = await params
  const t = await loadTicket(token)
  return { title: t ? `Ticket | ${t.event.title} | BASA` : 'Ticket | BASA', robots: { index: false, follow: false } }
}

export default async function TicketPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const t = await loadTicket(token)
  if (!t) notFound()

  const when = formatEventWhen(t.event.startDate, t.event.endDate)
  const where = formatEventWhere(t.event)
  const attendees = ticketAttendees(t)
  const qr = await ticketQrSvg(token)
  const status =
    t.status === 'CONFIRMED' ? { label: 'Confirmed', cls: 'bg-green-100 text-green-800' }
    : t.status === 'PENDING' ? { label: 'Payment pending', cls: 'bg-amber-100 text-amber-800' }
    : t.status === 'REFUNDED' ? { label: 'Refunded', cls: 'bg-gray-100 text-gray-700' }
    : { label: 'Cancelled', cls: 'bg-red-100 text-red-800' }

  return (
    <main className="min-h-screen bg-gray-100 py-10 px-4 print:bg-white print:py-0">
      <style>{`@media print { nav, footer, .no-print { display: none !important } body { background: #fff } }`}</style>
      <div className="mx-auto max-w-xl">
        <div className="no-print mb-4 flex items-center justify-between">
          <Link href={`/events/${t.event.slug}`} className="text-sm text-blue-700 underline">← Back to the event</Link>
          <PrintTicketButton />
        </div>

        <article className="overflow-hidden rounded-2xl border bg-white shadow-sm print:shadow-none print:border-gray-400">
          <header className="bg-[#1B365D] px-6 py-5 text-white">
            <p className="text-xs uppercase tracking-widest text-blue-200">Business Association of San Antonio</p>
            <h1 className="mt-1 text-2xl font-bold leading-tight">{t.event.title}</h1>
          </header>

          <div className="grid gap-6 px-6 py-6 sm:grid-cols-[1fr_auto]">
            <div className="space-y-4 text-gray-800">
              <div className="flex items-start gap-3">
                <CalendarDays className="mt-0.5 h-5 w-5 text-[#1B365D]" />
                <div>
                  <div className="font-semibold">{when.date}</div>
                  <div className="text-sm text-gray-600">{when.time}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 text-[#1B365D]" />
                <div className="text-sm">{where}</div>
              </div>
              <div className="flex items-start gap-3">
                <TicketIcon className="mt-0.5 h-5 w-5 text-[#1B365D]" />
                <div className="text-sm">
                  <ul className="space-y-0.5">
                    {t.items.map((i) => (
                      <li key={i.id}>
                        <span className="font-semibold">{i.quantity} ×</span> {i.ticketTier.name}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-1 text-gray-600">
                    {t.ticketCount} ticket{t.ticketCount === 1 ? '' : 's'} · ${Number(t.totalAmount).toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 text-sm">
                <div className="text-gray-500">Registered to</div>
                <div className="font-semibold text-gray-900">{t.name}</div>
                {t.company && <div className="text-gray-700">{t.company}</div>}
                <div className="text-gray-600">{t.email}</div>
                {attendees.length > 0 && (
                  <div className="mt-3">
                    <div className="text-gray-500">Attendees</div>
                    <ul className="text-gray-800">
                      {attendees.map((a, i) => <li key={i}>{a.name}</li>)}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.cls}`}>{status.label}</span>
                {t.checkedInAt && <span className="text-xs text-gray-500">Checked in</span>}
              </div>
            </div>

            <div className="flex flex-col items-center justify-start gap-2">
              <div className="w-44 sm:w-48 [&_svg]:h-auto [&_svg]:w-full" dangerouslySetInnerHTML={{ __html: qr }} />
              <div className="text-center text-[11px] leading-tight text-gray-500">
                Show this code at the door.<br />Ticket {token.slice(0, 8).toUpperCase()}
              </div>
            </div>
          </div>

          {t.status !== 'CONFIRMED' && (
            <div className="border-t bg-amber-50 px-6 py-3 text-sm text-amber-900 no-print">
              {t.status === 'PENDING'
                ? 'Payment has not completed yet. This ticket becomes valid as soon as it does.'
                : 'This registration is no longer valid.'}
            </div>
          )}
        </article>

        <p className="no-print mt-4 text-center text-xs text-gray-500">
          Save this page or take a screenshot of the QR code. Questions: info@businessassociationsa.com · (210) 549-7190
        </p>
      </div>
    </main>
  )
}
