import type { Status } from "@prisma/client"
import { prisma } from "@/lib/db"
import { MEMBERSHIP_TIERS } from "@/lib/membership-tiers"

/**
 * Server-side reads behind the member dashboard, the My Membership page and the
 * admin overview (#260). Those pages used to render fixed mock-up numbers.
 */

export interface MembershipSummary {
  status: Status
  /** Tier label, or the latest imported WordPress level name when no tier is set. */
  planLabel: string | null
  /** Annual price in cents, from the tier or the latest legacy membership. */
  priceCents: number | null
  joinedAt: Date
  renewalDate: Date | null
  chapterName: string | null
  history: {
    id: string
    levelName: string
    priceCents: number
    status: string
    startedAt: Date | null
    endedAt: Date | null
  }[]
}

export async function getMembershipSummary(userId: string): Promise<MembershipSummary | null> {
  const member = await prisma.member.findUnique({
    where: { userId },
    select: {
      membershipStatus: true,
      membershipTier: true,
      joinedAt: true,
      renewalDate: true,
      chapter: { select: { name: true } },
      legacyMemberships: {
        select: { id: true, levelName: true, price: true, status: true, startedAt: true, endedAt: true },
        orderBy: [{ startedAt: "desc" }, { createdAt: "desc" }],
      },
    },
  })
  if (!member) return null

  const history = member.legacyMemberships.map(h => ({
    id: h.id,
    levelName: h.levelName,
    priceCents: Math.round(Number(h.price) * 100),
    status: h.status,
    startedAt: h.startedAt,
    endedAt: h.endedAt,
  }))
  const tier = member.membershipTier ? MEMBERSHIP_TIERS[member.membershipTier] : null
  const latest = history[0]

  return {
    status: member.membershipStatus,
    planLabel: tier?.label ?? latest?.levelName ?? null,
    priceCents: tier?.priceCents ?? latest?.priceCents ?? null,
    joinedAt: member.joinedAt,
    renewalDate: member.renewalDate,
    chapterName: member.chapter?.name ?? null,
    history,
  }
}

export interface MyRegistration {
  id: string
  ticketCount: number
  event: { title: string; slug: string; startDate: Date; location: string }
}

/**
 * Confirmed tickets the user holds. Most registrations were bought or imported
 * without a member link, so the buyer email counts as well as `memberId`.
 */
export async function getMyRegistrations(userId: string, email: string | null | undefined, now = new Date()) {
  const member = await prisma.member.findUnique({ where: { userId }, select: { id: true } })
  const owner = [
    ...(member ? [{ memberId: member.id }] : []),
    ...(email ? [{ email: { equals: email, mode: "insensitive" as const } }] : []),
  ]
  if (owner.length === 0) return { upcoming: [] as MyRegistration[], attendedCount: 0 }

  const base = { status: "CONFIRMED" as const, OR: owner }
  const [upcoming, attendedCount] = await Promise.all([
    prisma.eventRegistration.findMany({
      where: { ...base, event: { endDate: { gte: now }, status: { not: "CANCELLED" } } },
      select: {
        id: true,
        ticketCount: true,
        event: { select: { title: true, slug: true, startDate: true, location: true } },
      },
      orderBy: { event: { startDate: "asc" } },
      take: 10,
    }),
    prisma.eventRegistration.count({ where: { ...base, event: { endDate: { lt: now } } } }),
  ])
  return { upcoming, attendedCount }
}

/** The next published events, as the public events page lists them. */
export async function getUpcomingEvents(limit: number, now = new Date()) {
  return prisma.event.findMany({
    where: { status: "PUBLISHED", endDate: { gte: now } },
    select: { id: true, title: true, slug: true, startDate: true, location: true },
    orderBy: { startDate: "asc" },
    take: limit,
  })
}

export async function countUpcomingEvents(now = new Date()) {
  return prisma.event.count({ where: { status: "PUBLISHED", endDate: { gte: now } } })
}

/** Directory-visible active members, newest first. Only for signed-in members. */
export async function getRecentDirectoryMembers(limit: number) {
  return prisma.member.findMany({
    where: { membershipStatus: "ACTIVE", showInDirectory: true },
    select: {
      id: true,
      businessName: true,
      user: { select: { firstName: true, lastName: true } },
    },
    orderBy: { joinedAt: "desc" },
    take: limit,
  })
}

export async function countActiveMembers() {
  return prisma.member.count({ where: { membershipStatus: "ACTIVE" } })
}

const DAY = 24 * 60 * 60 * 1000

export async function getAdminOverview(now = new Date()) {
  const monthAgo = new Date(now.getTime() - 30 * DAY)
  const [
    activeMembers,
    newMembers,
    upcomingEvents,
    eventsLastMonth,
    revenueAll,
    revenueMonth,
    openLeads,
    newLeads,
    pendingRateRequests,
    activity,
  ] = await Promise.all([
    countActiveMembers(),
    prisma.member.count({ where: { membershipStatus: "ACTIVE", joinedAt: { gte: monthAgo } } }),
    countUpcomingEvents(now),
    prisma.event.count({
      where: { status: { in: ["PUBLISHED", "COMPLETED"] }, startDate: { gte: monthAgo, lt: now } },
    }),
    prisma.eventRegistration.aggregate({ where: { status: "CONFIRMED" }, _sum: { totalAmount: true } }),
    prisma.eventRegistration.aggregate({
      where: { status: "CONFIRMED", createdAt: { gte: monthAgo } },
      _sum: { totalAmount: true },
    }),
    prisma.lead.count({ where: { status: "NEW" } }),
    prisma.lead.count({ where: { createdAt: { gte: monthAgo } } }),
    prisma.memberRateRequest.count({ where: { status: "PENDING" } }),
    prisma.auditLog.findMany({
      select: {
        id: true,
        action: true,
        entityType: true,
        timestamp: true,
        user: { select: { firstName: true, lastName: true, email: true } },
      },
      orderBy: { timestamp: "desc" },
      take: 8,
    }),
  ])

  return {
    activeMembers,
    newMembers,
    upcomingEvents,
    eventsLastMonth,
    ticketRevenueCents: Math.round(Number(revenueAll._sum.totalAmount ?? 0) * 100),
    ticketRevenueMonthCents: Math.round(Number(revenueMonth._sum.totalAmount ?? 0) * 100),
    openLeads,
    newLeads,
    pendingRateRequests,
    activity,
  }
}

const ACTION_LABELS: Record<string, string> = {
  MEMBERSHIP_ACTIVATED_MANUALLY: "Membership activated",
  SIGN_IN: "Signed in",
  EVENT_REGISTRATION_IMPORTED: "Event registration imported",
  EVENT_PAYMENT_COMPLETED: "Event ticket paid",
  PASSWORD_RESET_COMPLETED: "Password reset completed",
  PASSWORD_RESET_REQUESTED: "Password reset requested",
  CREATE_EVENT: "Event created",
}

/** "MEMBER_RATE_APPROVED" -> "Member rate approved" for actions without a label. */
export function describeAuditAction(action: string): string {
  if (ACTION_LABELS[action]) return ACTION_LABELS[action]
  const words = action.toLowerCase().replace(/_/g, " ")
  return words.charAt(0).toUpperCase() + words.slice(1)
}
