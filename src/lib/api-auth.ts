import { NextResponse } from "next/server"
import type { Session } from "next-auth"
import { timingSafeEqual } from "crypto"
import { auth } from "@/lib/auth"

/**
 * The roles the app actually checks, for validating any write to `User.role`.
 * SUPER_ADMIN used to be offered in the admin UI, but nothing grants it
 * anything (`requireAdmin` is `role === "ADMIN"`), so it is not accepted.
 */
export const USER_ROLES = ["GUEST", "MEMBER", "MODERATOR", "ADMIN"] as const

/**
 * Resolve the current session or return a 401 response.
 * Middleware does not protect /api routes, so every handler must call one of these.
 */
export async function requireSession(): Promise<Session | NextResponse> {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  return session
}

/** Resolve an ADMIN session or return 401/403. */
export async function requireAdmin(): Promise<Session | NextResponse> {
  const result = await requireSession()
  if (result instanceof NextResponse) return result
  if (result.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  return result
}

/** Dev-only tooling: 404 in production, admin-only elsewhere. */
export async function requireDevAdmin(): Promise<Session | NextResponse> {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  return requireAdmin()
}

export function isResponse(value: unknown): value is NextResponse {
  return value instanceof NextResponse
}

/**
 * True when the request carries `Authorization: Bearer <secret>`. Compared in
 * constant time so the secret cannot be recovered byte by byte from timings.
 */
export function hasBearerSecret(request: Request, secret: string): boolean {
  const given = Buffer.from(request.headers.get("authorization") ?? "")
  const expected = Buffer.from(`Bearer ${secret}`)
  return given.length === expected.length && timingSafeEqual(given, expected)
}
