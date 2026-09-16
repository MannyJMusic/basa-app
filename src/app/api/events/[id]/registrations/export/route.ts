import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin, isResponse } from '@/lib/api-auth'
import { ticketAttendees } from '@/lib/tickets'

/**
 * GET /api/events/:id/registrations/export  ->  CSV of everyone registered.
 *
 * The door list: one row per registration with buyer, tickets by tier, amount,
 * status, check-in time and the attendee names the buyer gave. Admin only.
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (isResponse(session)) return session
  const { id } = await params

  const event = await prisma.event.findUnique({ where: { id }, select: { slug: true, title: true } })
  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

  const regs = await prisma.eventRegistration.findMany({
    where: { eventId: id },
    orderBy: [{ status: 'asc' }, { name: 'asc' }],
    include: { items: { include: { ticketTier: { select: { name: true } } } } },
  })

  const header = ['Name', 'Email', 'Company', 'Phone', 'Tickets', 'Ticket types', 'Amount', 'Status', 'Checked in at', 'Checked in by', 'Attendees', 'Registered at', 'Registration id']
  const rows = regs.map((r) => [
    r.name,
    r.email,
    r.company ?? '',
    r.phone ?? '',
    String(r.ticketCount),
    r.items.map((i) => `${i.quantity} × ${i.ticketTier.name}`).join('; '),
    Number(r.totalAmount).toFixed(2),
    r.status,
    r.checkedInAt ? r.checkedInAt.toISOString() : '',
    r.checkedInBy ?? '',
    ticketAttendees(r as never).map((a) => a.name).join('; '),
    r.createdAt.toISOString(),
    r.id,
  ])

  const csv = [header, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n') + '\r\n'
  const filename = `${event.slug}-registrations-${new Date().toISOString().slice(0, 10)}.csv`
  return new NextResponse('﻿' + csv, {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="${filename}"`,
      'cache-control': 'no-store',
    },
  })
}

/** Quote every cell; neutralise a leading formula character so a spreadsheet does not execute it. */
function csvCell(value: string): string {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value
  return `"${safe.replace(/"/g, '""')}"`
}
