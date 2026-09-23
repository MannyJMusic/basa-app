import type { JWT } from "next-auth/jwt"
import { prisma } from "@/lib/db"
import { SYSTEM_USER_EMAIL } from "@/lib/system-user"

/**
 * Re-read the account behind a session token on every request after sign-in
 * (2026-09-22 audit, H-A3). The JWT lives 30 days, so without this a demoted
 * admin stays an admin and a deactivated member stays signed in until it
 * expires. Returns the refreshed token, or null to end the session.
 *
 * `auth()` only ever runs in Node (there is no middleware), so a primary-key
 * read here is fine.
 */
export async function revalidateToken(token: JWT): Promise<JWT | null> {
  if (!token.id) return null
  const current = await prisma.user.findUnique({
    where: { id: token.id as string },
    select: {
      email: true,
      role: true,
      isActive: true,
      accountStatus: true,
      sessionsInvalidBefore: true,
    },
  })
  if (
    !current ||
    current.email === SYSTEM_USER_EMAIL ||
    !current.isActive ||
    current.accountStatus === "INACTIVE" ||
    current.accountStatus === "SUSPENDED"
  ) {
    return null
  }
  // Tokens issued before a password reset (or any other "sign out everywhere")
  // are dead. `iat` is in seconds.
  if (
    current.sessionsInvalidBefore &&
    typeof token.iat === "number" &&
    token.iat < Math.floor(current.sessionsInvalidBefore.getTime() / 1000)
  ) {
    return null
  }
  token.email = current.email
  token.role = current.role
  token.isActive = current.isActive
  token.accountStatus = current.accountStatus
  return token
}
