import { randomBytes } from 'crypto'
import QRCode from 'qrcode'
import { prisma } from '@/lib/db'
import { SITE_URL } from '@/lib/site-url'

/**
 * Tickets (#159). A registration's ticket is a page at /tickets/<token>, where the
 * token is 32 random bytes in hex: unguessable, and the only thing a guest needs.
 * The QR code on the ticket encodes the admin check-in URL for the same token, so
 * scanning it at the door with any phone opens the check-in page directly.
 */

export function newTicketToken(): string {
  return randomBytes(32).toString('hex')
}

export const TOKEN_RE = /^[a-f0-9]{32,128}$/

export function ticketUrl(token: string): string {
  return `${SITE_URL}/tickets/${token}`
}

export function checkInUrl(token: string): string {
  return `${SITE_URL}/admin/check-in/${token}`
}

/** Inline SVG for the ticket page (crisp at any size, prints well). */
export async function ticketQrSvg(token: string): Promise<string> {
  return QRCode.toString(checkInUrl(token), { type: 'svg', errorCorrectionLevel: 'M', margin: 1, width: 320 })
}

/** PNG for email clients, which strip inline SVG and data: URIs alike. */
export async function ticketQrPng(token: string): Promise<Buffer> {
  return QRCode.toBuffer(checkInUrl(token), { type: 'png', errorCorrectionLevel: 'M', margin: 1, width: 360 })
}

/** Everything the ticket page, the email and the check-in page show. */
export async function loadTicket(token: string) {
  if (!TOKEN_RE.test(token)) return null
  return prisma.eventRegistration.findUnique({
    where: { ticketToken: token },
    include: {
      event: {
        select: {
          id: true, slug: true, title: true, startDate: true, endDate: true, location: true,
          address: true, city: true, state: true, zipCode: true, image: true, status: true,
          description: true, category: true, updatedAt: true,
        },
      },
      items: { include: { ticketTier: { select: { name: true } } }, orderBy: { createdAt: 'asc' } },
    },
  })
}

export type Ticket = NonNullable<Awaited<ReturnType<typeof loadTicket>>>

/** Attendee names as stored by the registration form. */
export function ticketAttendees(t: Ticket): Array<{ name: string; email?: string }> {
  const raw = t.attendees
  if (!Array.isArray(raw)) return []
  return raw
    .filter((a): a is { name: string; email?: string } => !!a && typeof a === 'object' && typeof (a as { name?: unknown }).name === 'string')
    .map((a) => ({ name: a.name, email: typeof a.email === 'string' ? a.email : undefined }))
}

const dateFmt = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'America/Chicago' })
const timeFmt = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Chicago' })

export function formatEventWhen(start: Date, end: Date): { date: string; time: string } {
  return { date: dateFmt.format(start), time: `${timeFmt.format(start)} – ${timeFmt.format(end)}` }
}

export function formatEventWhere(e: { location: string; address: string | null; city: string | null; state: string | null; zipCode: string | null }): string {
  const parts = [e.address, [e.city, e.state].filter(Boolean).join(', '), e.zipCode].filter(Boolean)
  return parts.length ? `${e.location}, ${parts.join(' ')}` : e.location
}
