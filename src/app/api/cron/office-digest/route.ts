import { NextRequest, NextResponse } from 'next/server'
import { hasBearerSecret } from '@/lib/api-auth'
import * as Sentry from '@sentry/nextjs'
import { sendOfficeDigest } from '@/lib/office-digest'

const { logger } = Sentry

/**
 * POST /api/cron/office-digest   Authorization: Bearer $CRON_SECRET
 *
 * Once a morning from the host's cron (see /etc/cron.d/basa): email the office one
 * summary of the last 24 hours instead of a message per registration. A day with
 * nothing new and nothing waiting sends nothing. Same auth shape as the other cron
 * routes; middleware does not guard /api/*, so this check is the only gate.
 *
 * Testing: `?to=a@b.c` sends only to that address, and `?force=1` sends even on a
 * quiet day. Both still need the secret, so neither can be used to mail strangers.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    logger.error('CRON_SECRET is not set; refusing to send the office digest')
    return NextResponse.json({ error: 'Not configured' }, { status: 503 })
  }
  if (!hasBearerSecret(request, secret)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const params = request.nextUrl.searchParams
  const to = params.getAll('to').flatMap(v => v.split(',')).map(s => s.trim()).filter(Boolean)
  const force = params.get('force') === '1'

  return Sentry.startSpan({ op: 'cron.office_digest', name: 'Send the office daily digest' }, async span => {
    try {
      const result = await sendOfficeDigest({ to, force })
      span.setAttribute('digest.sent', result.sent)
      span.setAttribute('digest.new_registrations', result.newRegistrations)
      span.setAttribute('digest.pending_requests', result.pendingRequests)
      return NextResponse.json({ ok: true, ...result })
    } catch (error) {
      Sentry.captureException(error)
      return NextResponse.json({ error: 'Office digest failed' }, { status: 500 })
    }
  })
}
