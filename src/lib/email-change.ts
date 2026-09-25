import { randomBytes } from 'crypto'
import * as Sentry from '@sentry/nextjs'
import { prisma } from '@/lib/db'
import { SITE_URL } from '@/lib/site-url'
import { EMAIL_CHANGE_LINK_HOURS, sendEmailChangeConfirmationEmail, sendEmailChangeNoticeEmail } from '@/lib/basa-emails'

/**
 * Changing your own email address (2026-09-22 audit, M-A8).
 *
 * The profile form used to write a new address straight onto the account, so
 * anyone signed in could point an account at an address they do not control (or
 * one another buyer already uses, which is how guest receipts are matched). Now
 * the address is only pending until a link sent to it is used; the current
 * address is told. Confirming signs out every session, since sign-in and
 * receipts key on the email.
 */
export class EmailChangeError extends Error {
  constructor(message: string, readonly status = 400) {
    super(message)
    this.name = 'EmailChangeError'
    // tsconfig targets ES5; without this `instanceof` fails.
    Object.setPrototypeOf(this, EmailChangeError.prototype)
  }
}

const normalise = (email: string) => email.trim().toLowerCase()

async function addressTaken(email: string, exceptUserId: string) {
  const other = await prisma.user.findFirst({
    where: { email: { equals: email, mode: 'insensitive' }, NOT: { id: exceptUserId } },
    select: { id: true },
  })
  return Boolean(other)
}

/** Record the new address as pending and send both emails. Returns the pending address. */
export async function requestEmailChange(userId: string, requestedEmail: string): Promise<string> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, firstName: true, name: true } })
  if (!user) throw new EmailChangeError('Account not found', 404)
  const newEmail = normalise(requestedEmail)
  if (user.email && normalise(user.email) === newEmail) throw new EmailChangeError('That is already your email address')
  if (await addressTaken(newEmail, user.id)) throw new EmailChangeError('That email address is already used by another account')

  // A new request replaces any earlier one: only the newest link works.
  const token = randomBytes(32).toString('hex')
  await prisma.user.update({
    where: { id: user.id },
    data: { pendingEmail: newEmail, emailChangeToken: token, emailChangeTokenExpiry: new Date(Date.now() + EMAIL_CHANGE_LINK_HOURS * 60 * 60 * 1000) },
  })
  const first = user.firstName || (user.name ?? '').split(' ')[0] || ''
  await sendEmailChangeConfirmationEmail(newEmail, first, `${SITE_URL}/auth/confirm-email?token=${token}`)
  if (user.email) {
    try {
      await sendEmailChangeNoticeEmail(user.email, first, newEmail)
    } catch (error) {
      // The change is still gated on the new address; a lost heads-up must not block it.
      Sentry.captureException(error, { extra: { userId } })
    }
  }
  await prisma.auditLog.create({
    data: { userId: user.id, action: 'EMAIL_CHANGE_REQUESTED', entityType: 'USER', entityId: user.id, newValues: { pendingEmail: newEmail } },
  })
  return newEmail
}

/** Apply a pending change from its link. Single use; ends every session on the account. */
export async function confirmEmailChange(token: unknown): Promise<{ email: string }> {
  // A plain string only: an object would reach Prisma as a filter.
  if (typeof token !== 'string' || token.length < 16 || token.length > 200) throw new EmailChangeError('This link is not valid')
  const user = await prisma.user.findUnique({
    where: { emailChangeToken: token },
    select: { id: true, email: true, pendingEmail: true, emailChangeTokenExpiry: true },
  })
  if (!user || !user.pendingEmail) throw new EmailChangeError('This link is not valid or has already been used')
  if (!user.emailChangeTokenExpiry || user.emailChangeTokenExpiry < new Date()) {
    throw new EmailChangeError('This link has expired. Change your email again from your profile to get a new one.')
  }
  // Someone else may have taken the address since the request.
  if (await addressTaken(user.pendingEmail, user.id)) {
    await prisma.user.update({ where: { id: user.id }, data: { pendingEmail: null, emailChangeToken: null, emailChangeTokenExpiry: null } })
    throw new EmailChangeError('That email address is now used by another account, so the change was cancelled.', 409)
  }

  const newEmail = user.pendingEmail
  // Scoped by the token as well, so two clicks racing the same link apply once.
  const applied = await prisma.user.updateMany({
    where: { id: user.id, emailChangeToken: token },
    data: {
      email: newEmail,
      emailVerified: new Date(),
      pendingEmail: null,
      emailChangeToken: null,
      emailChangeTokenExpiry: null,
      sessionsInvalidBefore: new Date(),
    },
  })
  if (applied.count !== 1) throw new EmailChangeError('This link is not valid or has already been used')
  await prisma.auditLog.create({
    data: { userId: user.id, action: 'EMAIL_CHANGED', entityType: 'USER', entityId: user.id, oldValues: { email: user.email }, newValues: { email: newEmail } },
  })
  return { email: newEmail }
}
