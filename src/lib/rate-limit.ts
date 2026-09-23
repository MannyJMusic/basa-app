import type { NextRequest } from 'next/server'

/**
 * A fixed-window counter held in process memory. Production runs one app
 * container, so this is a real limit there; it resets on restart, which is
 * acceptable for its job of blunting scripted abuse of public endpoints. nginx
 * `limit_req` is the outer layer (stage 4 of the 2026-09-22 audit).
 */
const windows = new Map<string, { count: number; resetAt: number }>()

/** Count one hit against `key`; true when it is over `limit` within `windowMs`. */
export function hitRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  // Opportunistic sweep so the map cannot grow without bound.
  if (windows.size > 10_000) {
    windows.forEach((w, k) => {
      if (w.resetAt <= now) windows.delete(k)
    })
  }
  const w = windows.get(key)
  if (!w || w.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + windowMs })
    return false
  }
  w.count++
  return w.count > limit
}

/**
 * The caller's address as nginx saw it. The container listens on 127.0.0.1
 * only and nginx sets X-Real-IP from `$remote_addr`, so the header cannot be
 * supplied by the client.
 */
export function clientIp(request: NextRequest): string {
  return request.headers.get('x-real-ip') ?? 'unknown'
}
