import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/db"

export interface TierSelection {
  ticketTierId: string
  quantity: number
}

export interface PricedLine {
  ticketTierId: string
  name: string
  quantity: number
  /** Price actually charged per ticket, member or standard. Snapshotted onto the item. */
  unitPrice: Prisma.Decimal
}

export interface PricedOrder {
  lines: PricedLine[]
  totalTickets: number
  total: Prisma.Decimal
  /** Stripe wants an integer minor unit; never derive this from a float. */
  totalCents: number
}

export class TicketAvailabilityError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "TicketAvailabilityError"
    // Required because tsconfig targets ES5: subclassing a built-in there loses the
    // prototype chain, so `instanceof TicketAvailabilityError` is false and the
    // caller's 409 branch would silently fall through to a 500.
    Object.setPrototypeOf(this, TicketAvailabilityError.prototype)
  }
}

/** Registrations in these states hold a seat; cancelled ones release it. */
const HOLDS_A_SEAT = ["PENDING", "CONFIRMED"] as const

/**
 * How many tickets are already committed per tier for an event, and overall.
 * Counted from registration items rather than `ticketCount`, so a registration
 * spanning several tiers is attributed correctly.
 */
export async function soldCounts(eventId: string) {
  const rows = await prisma.eventRegistrationItem.groupBy({
    by: ["ticketTierId"],
    _sum: { quantity: true },
    where: {
      registration: { eventId, status: { in: [...HOLDS_A_SEAT] } },
    },
  })

  const perTier = new Map<string, number>()
  let total = 0
  for (const r of rows) {
    const n = r._sum.quantity ?? 0
    perTier.set(r.ticketTierId, n)
    total += n
  }
  return { perTier, total }
}

/**
 * Price a selection and prove it can be fulfilled, in one pass.
 *
 * Throws `TicketAvailabilityError` rather than returning a partial order: a caller
 * that charges a card first and discovers the shortfall afterwards has already taken
 * someone's money for a ticket that does not exist.
 */
export async function priceSelection(
  eventId: string,
  selections: TierSelection[],
  isMember: boolean,
  now: Date = new Date()
): Promise<PricedOrder> {
  if (!selections.length) {
    throw new TicketAvailabilityError("No tickets selected")
  }
  if (selections.some(s => !Number.isInteger(s.quantity) || s.quantity < 1)) {
    throw new TicketAvailabilityError("Ticket quantities must be whole numbers of at least 1")
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { ticketTiers: true },
  })
  if (!event) throw new TicketAvailabilityError("Event not found")

  const sold = await soldCounts(eventId)
  const lines: PricedLine[] = []
  let totalTickets = 0
  let total = new Prisma.Decimal(0)

  for (const sel of selections) {
    const tier = event.ticketTiers.find(t => t.id === sel.ticketTierId)
    if (!tier) throw new TicketAvailabilityError("Unknown ticket type for this event")
    if (!tier.isActive) throw new TicketAvailabilityError(`${tier.name} is not on sale`)
    if (tier.salesStartAt && now < tier.salesStartAt) {
      throw new TicketAvailabilityError(`${tier.name} is not on sale yet`)
    }
    if (tier.salesEndAt && now > tier.salesEndAt) {
      throw new TicketAvailabilityError(`Sales for ${tier.name} have closed`)
    }

    if (tier.quantity !== null) {
      const remaining = tier.quantity - (sold.perTier.get(tier.id) ?? 0)
      if (sel.quantity > remaining) {
        throw new TicketAvailabilityError(
          remaining <= 0
            ? `${tier.name} is sold out`
            : `Only ${remaining} of ${tier.name} remain`
        )
      }
    }

    // Members pay memberPrice where the tier sets one; otherwise everyone pays price.
    const unitPrice = isMember && tier.memberPrice !== null ? tier.memberPrice : tier.price
    lines.push({ ticketTierId: tier.id, name: tier.name, quantity: sel.quantity, unitPrice })
    totalTickets += sel.quantity
    total = total.add(unitPrice.mul(sel.quantity))
  }

  // The event's own capacity caps the sum of all tiers, however generous the tiers are.
  if (event.capacity !== null) {
    const remaining = event.capacity - sold.total
    if (totalTickets > remaining) {
      throw new TicketAvailabilityError(
        remaining <= 0 ? "This event is full" : `Only ${remaining} places remain for this event`
      )
    }
  }

  return {
    lines,
    totalTickets,
    total,
    totalCents: total.mul(100).toDecimalPlaces(0).toNumber(),
  }
}

/**
 * Keeps `Event.price` / `memberPrice` in step with the tiers, as the "from" figure the
 * listing and calendar pages already display. Tiers are the source of truth for what a
 * ticket costs; these two columns are a derived summary.
 */
export async function syncEventPricingFromTiers(eventId: string) {
  const tiers = await prisma.ticketTier.findMany({
    where: { eventId, isActive: true },
    select: { price: true, memberPrice: true },
  })
  if (!tiers.length) return

  const lowest = (values: (Prisma.Decimal | null)[]) => {
    const present = values.filter((v): v is Prisma.Decimal => v !== null)
    return present.length ? present.reduce((a, b) => (a.lessThan(b) ? a : b)) : null
  }

  await prisma.event.update({
    where: { id: eventId },
    data: {
      price: lowest(tiers.map(t => t.price)),
      memberPrice: lowest(tiers.map(t => t.memberPrice ?? t.price)),
    },
  })
}
