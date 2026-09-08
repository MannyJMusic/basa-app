import { NextRequest, NextResponse } from "next/server"
import * as Sentry from "@sentry/nextjs"
import { expireLapsedMemberships } from "@/lib/membership-lifecycle"

const { logger } = Sentry

/**
 * Daily sweep that expires lapsed memberships.
 *
 * Called by the host's cron, not by a user, so it authenticates with a shared
 * secret rather than a session. Middleware does not guard /api/* at all, so this
 * check is the only thing standing in front of it.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    logger.error("CRON_SECRET is not set; refusing to run the membership expiry sweep")
    return NextResponse.json({ error: "Not configured" }, { status: 503 })
  }

  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  return Sentry.startSpan(
    { op: "cron.membership_expiry", name: "Expire lapsed memberships" },
    async span => {
      try {
        const result = await expireLapsedMemberships()

        span.setAttribute("memberships.expired", result.expired)
        span.setAttribute("memberships.missing_renewal_date", result.missingRenewalDate)

        if (result.missingRenewalDate > 0) {
          logger.warn(
            logger.fmt`${result.missingRenewalDate} active members have no renewalDate and can never expire`
          )
        }

        return NextResponse.json({ ok: true, ...result })
      } catch (error) {
        Sentry.captureException(error)
        return NextResponse.json({ error: "Expiry sweep failed" }, { status: 500 })
      }
    }
  )
}
