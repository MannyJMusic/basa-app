import { prisma } from '@/lib/db'

/**
 * Principal that audit-log rows are attributed to when no human is acting
 * (newsletter subscriptions, unsubscribes). It must never be able to sign in:
 * it used to be created as an active ADMIN with no password (2026-09-22 audit),
 * which made it claimable through "forgot password" or OAuth linking by whoever
 * controls the mailbox. It is now inactive, non-admin, and denied in auth.
 */
export const SYSTEM_USER_EMAIL = 'system@basa.org'

const SAFE_SYSTEM_USER = {
  role: 'GUEST' as const,
  isActive: false,
  accountStatus: 'INACTIVE' as const,
  hashedPassword: null,
}

export async function getSystemUser() {
  const existing = await prisma.user.findUnique({ where: { email: SYSTEM_USER_EMAIL } })

  if (!existing) {
    return prisma.user.create({
      data: {
        email: SYSTEM_USER_EMAIL,
        firstName: 'System',
        lastName: 'User',
        name: 'System User',
        ...SAFE_SYSTEM_USER,
      },
    })
  }

  // Self-heal a row created by the old code (active ADMIN) or tampered with since.
  if (
    existing.isActive ||
    existing.role !== SAFE_SYSTEM_USER.role ||
    existing.hashedPassword !== null ||
    existing.accountStatus !== SAFE_SYSTEM_USER.accountStatus
  ) {
    return prisma.user.update({ where: { id: existing.id }, data: SAFE_SYSTEM_USER })
  }

  return existing
}
