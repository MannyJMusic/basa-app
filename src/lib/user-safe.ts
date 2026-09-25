/**
 * A User row without its credentials: the password hash and every one-time token.
 * Anything that returns a user row to a browser goes through this, including the
 * user's own profile - a token that reaches the browser can be used without the
 * inbox it was meant for.
 */
const SECRET_FIELDS = [
  'hashedPassword',
  'resetToken', 'resetTokenExpiry',
  'verificationToken', 'verificationTokenExpiry',
  'emailChangeToken', 'emailChangeTokenExpiry',
] as const

export function withoutSecrets<T extends Record<string, unknown>>(user: T): Omit<T, (typeof SECRET_FIELDS)[number]> {
  const copy: Record<string, unknown> = { ...user }
  for (const f of SECRET_FIELDS) delete copy[f]
  return copy as Omit<T, (typeof SECRET_FIELDS)[number]>
}
