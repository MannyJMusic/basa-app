import { randomBytes } from 'crypto'
import * as Sentry from '@sentry/nextjs'
import { prisma } from '@/lib/db'
import { SITE_URL } from '@/lib/site-url'
import { INVITATION_LINK_DAYS, sendMemberInvitationEmail } from '@/lib/basa-emails'

/**
 * Inviting active members to set up their account.
 *
 * Members imported from WordPress, or activated by staff, have an account with no
 * password (`hashedPassword` null, `accountStatus` INACTIVE): the account-claim
 * state in src/lib/account-claim.ts. An invitation is a claim link sent by an admin
 * instead of requested by the member: the same single-use reset token and the same
 * /auth/reset-password page, which activates the account when the password is set.
 * It lasts INVITATION_LINK_DAYS instead of an hour, because nobody asked for it and
 * it may sit in an inbox for a while.
 */
export const INVITATION_ACTION = 'ACCOUNT_INVITATION_SENT'
const MAX_PER_REQUEST = 100

export interface InvitableMember {
  userId: string
  name: string
  email: string
  businessName: string | null
  renewalDate: Date | null
  lastInvitedAt: Date | null
  invitations: number
}

/** Active members whose account has never had a password, with their invitation history. */
export async function listInvitableMembers(): Promise<{ pending: InvitableMember[]; setUp: number }> {
  const members = await prisma.member.findMany({
    where: { membershipStatus: 'ACTIVE' },
    select: {
      businessName: true,
      renewalDate: true,
      user: { select: { id: true, email: true, firstName: true, lastName: true, name: true, hashedPassword: true, accountStatus: true } },
    },
  })
  const unclaimed = members.filter(m => m.user.hashedPassword === null && m.user.accountStatus === 'INACTIVE' && m.user.email)
  const history = unclaimed.length
    ? await prisma.auditLog.groupBy({
        by: ['entityId'],
        where: { action: INVITATION_ACTION, entityType: 'USER', entityId: { in: unclaimed.map(m => m.user.id) } },
        _max: { timestamp: true },
        _count: { _all: true },
      })
    : []
  const byUser = new Map(history.map(h => [h.entityId, h]))

  const pending = unclaimed
    .map(m => ({
      userId: m.user.id,
      name: [m.user.firstName, m.user.lastName].filter(Boolean).join(' ') || m.user.name || m.user.email!,
      email: m.user.email!,
      businessName: m.businessName,
      renewalDate: m.renewalDate,
      lastInvitedAt: byUser.get(m.user.id)?._max.timestamp ?? null,
      invitations: byUser.get(m.user.id)?._count._all ?? 0,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
  return { pending, setUp: members.length - unclaimed.length }
}

export type InvitationResult =
  | { userId: string; email: string; status: 'sent' }
  | { userId: string; email?: string; status: 'skipped'; reason: string }
  | { userId: string; email?: string; status: 'failed'; reason: string }

/**
 * Send invitations. Eligibility is re-checked here for every id, whatever the page
 * asked for: only an active member with an unclaimed account gets a link. Sent one
 * at a time; a failure on one address does not stop the rest.
 */
export async function sendInvitations(userIds: string[], adminUserId: string): Promise<InvitationResult[]> {
  const ids = Array.from(new Set(userIds)).slice(0, MAX_PER_REQUEST)
  const results: InvitationResult[] = []

  for (const userId of ids) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, firstName: true, name: true, hashedPassword: true, accountStatus: true, member: { select: { membershipStatus: true } } },
    })
    if (!user?.email) { results.push({ userId, status: 'skipped', reason: 'No such user, or no email address' }); continue }
    if (user.member?.membershipStatus !== 'ACTIVE') { results.push({ userId, email: user.email, status: 'skipped', reason: 'Membership is not active' }); continue }
    if (user.hashedPassword !== null || user.accountStatus !== 'INACTIVE') {
      results.push({ userId, email: user.email, status: 'skipped', reason: 'Account is already set up' }); continue
    }

    // A new invitation replaces any earlier link: only the newest one works.
    const token = randomBytes(32).toString('hex')
    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetTokenExpiry: new Date(Date.now() + INVITATION_LINK_DAYS * 24 * 60 * 60 * 1000) },
    })
    const url = `${SITE_URL}/auth/reset-password?token=${token}&email=${encodeURIComponent(user.email)}&claim=1`

    try {
      await sendMemberInvitationEmail(user.email, user.firstName || (user.name ?? '').split(' ')[0] || '', url)
    } catch (error) {
      Sentry.captureException(error, { extra: { userId } })
      results.push({ userId, email: user.email, status: 'failed', reason: 'The email could not be sent' })
      continue
    }

    await prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: INVITATION_ACTION,
        entityType: 'USER',
        entityId: user.id,
        newValues: { email: user.email, linkDays: INVITATION_LINK_DAYS },
      },
    })
    results.push({ userId, email: user.email, status: 'sent' })
  }
  return results
}
