import { NextRequest, NextResponse } from 'next/server'
import { hasBearerSecret } from '@/lib/api-auth'
import * as Sentry from '@sentry/nextjs'
import { releaseStaleHolds, STALE_HOLD_MINUTES } from '@/lib/stale-holds'

const { logger } = Sentry

/**
 * POST /api/cron/release-stale-holds   Authorization: Bearer $CRON_SECRET
 *
 * Every 15 minutes from the host's cron (see /etc/cron.d/basa): release seats held
 * by checkouts abandoned more than STALE_HOLD_MINUTES ago, after asking Stripe
 * whether the payment actually completed. Same auth shape as membership-expiry.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    logger.error('CRON_SECRET is not set; refusing to run the stale hold sweep')
    return NextResponse.json({ error: 'Not configured' }, { status: 503 })
  }
  if (!hasBearerSecret(request, secret)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return Sentry.startSpan({ op: 'cron.stale_holds', name: 'Release abandoned registration holds' }, async span => {
    try {
      const result = await releaseStaleHolds()
      span.setAttribute('holds.examined', result.examined)
      span.setAttribute('holds.released', result.released)
      span.setAttribute('holds.confirmed', result.confirmed)
      span.setAttribute('holds.failed', result.failed)
      if (result.failed > 0) logger.error(logger.fmt`${result.failed} stale holds could not be resolved`)
      return NextResponse.json({ ok: true, olderThanMinutes: STALE_HOLD_MINUTES, ...result })
    } catch (error) {
      Sentry.captureException(error)
      return NextResponse.json({ error: 'Stale hold sweep failed' }, { status: 500 })
    }
  })
}
