import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin, isResponse } from '@/lib/api-auth'
import { tierInput, resolvePairing } from '@/lib/ticket-tier-admin'

/** Edit or remove one ticket tier (#160). Admin only. */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string; tierId: string }> }) {
  const session = await requireAdmin()
  if (isResponse(session)) return session
  const { id, tierId } = await params

  const existing = await prisma.ticketTier.findFirst({ where: { id: tierId, eventId: id } })
  if (!existing) return NextResponse.json({ error: 'Ticket tier not found' }, { status: 404 })

  const parsed = tierInput.partial().safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0]?.message ?? 'Invalid tier' }, { status: 400 })
  const d = parsed.data
  const price = d.price ?? Number(existing.price)
  const memberPrice = d.memberPrice === undefined ? (existing.memberPrice === null ? null : Number(existing.memberPrice)) : d.memberPrice
  if (memberPrice != null && memberPrice > price) {
    return NextResponse.json({ error: 'Member price cannot be higher than the regular price' }, { status: 400 })
  }

  // Audience and pairing are settled together: a tier that stops being MEMBER loses
  // its pairing, and a tier that stops being NON_MEMBER is unpaired from member tiers.
  const audience = d.audience ?? existing.audience
  const touchesPairing = d.audience !== undefined || d.nonMemberTierId !== undefined
  const pairing = touchesPairing
    ? await resolvePairing(id, tierId, audience, d.nonMemberTierId === undefined ? existing.nonMemberTierId : d.nonMemberTierId)
    : null
  if (pairing && 'error' in pairing) return NextResponse.json({ error: pairing.error }, { status: 400 })
  if (d.audience !== undefined && d.audience !== 'NON_MEMBER' && existing.audience === 'NON_MEMBER') {
    await prisma.ticketTier.updateMany({ where: { nonMemberTierId: tierId }, data: { nonMemberTierId: null } })
  }

  const tier = await prisma.ticketTier.update({
    where: { id: tierId },
    data: {
      ...(d.name !== undefined && { name: d.name }),
      ...(d.description !== undefined && { description: d.description }),
      ...(d.price !== undefined && { price: d.price }),
      ...(d.memberPrice !== undefined && { memberPrice: d.memberPrice }),
      ...(d.quantity !== undefined && { quantity: d.quantity }),
      ...(d.salesStartAt !== undefined && { salesStartAt: d.salesStartAt ? new Date(d.salesStartAt) : null }),
      ...(d.salesEndAt !== undefined && { salesEndAt: d.salesEndAt ? new Date(d.salesEndAt) : null }),
      ...(d.sortOrder !== undefined && { sortOrder: d.sortOrder }),
      ...(d.isActive !== undefined && { isActive: d.isActive }),
      ...(d.audience !== undefined && { audience: d.audience }),
      ...(pairing && 'value' in pairing && { nonMemberTierId: pairing.value }),
    },
  })
  return NextResponse.json(tier)
}

/**
 * A tier nobody has bought can be deleted. One with registrations against it is
 * switched off instead, so the records that reference it stay intact.
 */
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string; tierId: string }> }) {
  const session = await requireAdmin()
  if (isResponse(session)) return session
  const { id, tierId } = await params

  const existing = await prisma.ticketTier.findFirst({ where: { id: tierId, eventId: id }, select: { id: true } })
  if (!existing) return NextResponse.json({ error: 'Ticket tier not found' }, { status: 404 })

  const used = await prisma.eventRegistrationItem.count({ where: { ticketTierId: tierId } })
  if (used > 0) {
    const tier = await prisma.ticketTier.update({ where: { id: tierId }, data: { isActive: false } })
    return NextResponse.json({ deactivated: true, tier, reason: `${used} registration line(s) reference this tier; it was switched off instead of deleted` })
  }
  await prisma.ticketTier.delete({ where: { id: tierId } })
  return NextResponse.json({ deleted: true })
}
