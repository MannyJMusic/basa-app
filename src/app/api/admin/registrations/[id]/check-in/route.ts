import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { requireAdmin, isResponse } from '@/lib/api-auth'

const bodySchema = z.object({ checkedIn: z.boolean() })

/**
 * POST /api/admin/registrations/:id/check-in  { checkedIn: true | false }
 *
 * Marks a registration as arrived (or undoes it). Used by the QR check-in page
 * and by the registrations tab in the admin. Only confirmed registrations can be
 * checked in: a pending or cancelled one is a payment problem for the desk to
 * resolve, not something to wave through.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (isResponse(session)) return session
  const { id } = await params

  let body: z.infer<typeof bodySchema>
  try {
    body = bodySchema.parse(await request.json())
  } catch {
    return NextResponse.json({ error: 'Body must be { checkedIn: boolean }' }, { status: 400 })
  }

  const reg = await prisma.eventRegistration.findUnique({ where: { id }, select: { id: true, status: true, checkedInAt: true } })
  if (!reg) return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
  if (body.checkedIn && reg.status !== 'CONFIRMED') {
    return NextResponse.json({ error: `Cannot check in a ${reg.status.toLowerCase()} registration` }, { status: 409 })
  }

  const updated = await prisma.eventRegistration.update({
    where: { id },
    data: body.checkedIn
      ? { checkedInAt: reg.checkedInAt ?? new Date(), checkedInBy: session.user?.email ?? session.user?.id ?? 'admin' }
      : { checkedInAt: null, checkedInBy: null },
    select: { id: true, checkedInAt: true, checkedInBy: true, status: true },
  })
  return NextResponse.json(updated)
}
