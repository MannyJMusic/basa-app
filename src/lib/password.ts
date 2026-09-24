import bcrypt from "bcryptjs"

/**
 * Password hashing, server side only. It used to live in `@/lib/utils`, which every
 * UI component imports for `cn()`, so bcryptjs - and the browser stand-ins for
 * Node's crypto, buffer, stream, util and vm that it drags in - shipped to every
 * page. Keep anything Node-only out of `utils`.
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}
