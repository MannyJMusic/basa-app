import { NextRequest, NextResponse } from 'next/server'

/**
 * The absolute origin to build calendar URLs and UIDs from.
 *
 * NEXTAUTH_URL is what the rest of the app already uses for absolute links, so
 * the feed agrees with the emails. The request is the fallback, which keeps the
 * feed working on a preview host where that variable is not set - but a UID must
 * not change if a member reaches the feed by a different hostname, so the
 * configured value wins whenever there is one.
 */
export function requestOrigin(request: NextRequest): string {
  const configured = process.env.NEXTAUTH_URL
  if (configured) return configured.replace(/\/$/, '')
  return new URL(request.url).origin
}

export function icsResponse(body: string, opts: { filename?: string; maxAge: number }): NextResponse {
  return new NextResponse(body, {
    headers: {
      // charset matters: descriptions carry emoji and curly quotes.
      'Content-Type': 'text/calendar; charset=utf-8',
      // A subscribed feed is fetched by a server, not the member's browser, so it
      // is served inline. Only the single-event download gets an attachment name.
      ...(opts.filename ? { 'Content-Disposition': `attachment; filename="${opts.filename}"` } : {}),
      'Cache-Control': `public, max-age=${opts.maxAge}, s-maxage=${opts.maxAge}`,
    },
  })
}
