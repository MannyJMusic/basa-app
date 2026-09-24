import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin, isResponse } from '@/lib/api-auth'
import { tierInput, listTiersForAdmin, resolvePairing } from '@/lib/ticket-tier-admin'

/**
 * Admin view of an event's ticket tiers (#160): every tier including inactive ones,
 * with sold counts, plus creation. The public route at /api/events/:id/ticket-tiers
 * shows only what is on sale.
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (isResponse(session)) return session
  const { id } = await params
  const event = await prisma.event.findUnique({ where: { id }, select: { id: true } })
  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })
  return NextResponse.json(await listTiersForAdmin(id))
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (isResponse(session)) return session
  const { id } = await params
  const event = await prisma.event.findUnique({ where: { id }, select: { id: true } })
  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

  const parsed = tierInput.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0]?.message ?? 'Invalid tier' }, { status: 400 })
  const d = parsed.data
  if (d.memberPrice != null && d.memberPrice > d.price) {
    return NextResponse.json({ error: 'Member price cannot be higher than the regular price' }, { status: 400 })
  }

  const audience = d.audience ?? 'ALL'
  const pairing = await resolvePairing(id, null, audience, d.nonMemberTierId)
  if ('error' in pairing) return NextResponse.json({ error: pairing.error }, { status: 400 })

  const last = await prisma.ticketTier.findFirst({ where: { eventId: id }, orderBy: { sortOrder: 'desc' }, select: { sortOrder: true } })
  const tier = await prisma.ticketTier.create({
    data: {
      eventId: id,
      name: d.name,
      description: d.description ?? null,
      price: d.price,
      memberPrice: d.memberPrice ?? null,
      quantity: d.quantity ?? null,
      salesStartAt: d.salesStartAt ? new Date(d.salesStartAt) : null,
      salesEndAt: d.salesEndAt ? new Date(d.salesEndAt) : null,
      sortOrder: d.sortOrder ?? (last ? last.sortOrder + 1 : 0),
      isActive: d.isActive ?? true,
      audience,
      nonMemberTierId: pairing.value,
    },
  })
  return NextResponse.json(tier, { status: 201 })
}
