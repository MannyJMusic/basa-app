import { NextRequest, NextResponse } from "next/server"
import * as Sentry from "@sentry/nextjs"
import { passwordResetRequestSchema } from "@/lib/validations"
import { prisma } from "@/lib/db"
import { sendPasswordResetEmail, sendAccountClaimEmail } from "@/lib/basa-emails"
import { isUnclaimedLegacyAccount } from "@/lib/account-claim"
import { hitRateLimit } from "@/lib/rate-limit"
import crypto from "crypto"

/** How long a link requested here lasts. Invitations last longer (member-invitations.ts). */
const RESET_LINK_MS = 60 * 60 * 1000
/** Requests per address per window. Beyond it the answer is the same and nothing is sent. */
const RESET_REQUESTS_PER_EMAIL = 3
const RESET_REQUEST_WINDOW_MS = 60 * 60 * 1000

const GENERIC_ANSWER = {
  message: "If an account with that email exists, a password reset link has been sent.",
}

/**
 * Ask for a password reset (or, for an account that has never had a password, a
 * link to set one up).
 *
 * Every outcome - unknown address, throttled, sent, send failed - gets the same
 * answer, and the email is sent without the response waiting for it, so neither
 * the body nor the response time says whether an address has an account.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = passwordResetRequestSchema.parse(body)
    const email = parsed.email.trim().toLowerCase()

    // Per address, so nobody can use this form to flood a member's inbox. Counted
    // for unknown addresses too, so the throttle reveals nothing either.
    if (hitRateLimit(`forgot-password:${email}`, RESET_REQUESTS_PER_EMAIL, RESET_REQUEST_WINDOW_MS)) {
      return NextResponse.json(GENERIC_ANSWER, { status: 200 })
    }

    // Stored addresses are not all lower-case (imports, staff entry).
    const user = await prisma.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
    })

    if (!user || !user.email) {
      // Don't reveal if user exists or not for security
      return NextResponse.json(GENERIC_ANSWER, { status: 200 })
    }

    // An unexpired link that outlives the one we would issue - an invitation, which
    // lasts days - is kept and sent again. Replacing it with a 1-hour token would
    // quietly break the invitation the member may still be about to use.
    const now = Date.now()
    const newExpiry = new Date(now + RESET_LINK_MS)
    let resetToken: string
    let expiresAt = newExpiry
    if (user.resetToken && user.resetTokenExpiry && user.resetTokenExpiry > newExpiry) {
      resetToken = user.resetToken
      expiresAt = user.resetTokenExpiry
    } else {
      resetToken = crypto.randomBytes(32).toString('hex')
      await prisma.user.update({
        where: { id: user.id },
        data: { resetToken, resetTokenExpiry: newExpiry },
      })
    }

    // A member imported from WordPress has no password to reset, so "reset your
    // password" is the wrong thing to send them - that was the dishonest answer #104
    // was filed about. Same token mechanics, different wording, and completing it
    // activates the account.
    const claiming = isUnclaimedLegacyAccount(user)

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: claiming ? "ACCOUNT_CLAIM_REQUESTED" : "PASSWORD_RESET_REQUESTED",
        entityType: "USER",
        entityId: user.id,
        newValues: {
          timestamp: new Date().toISOString()
        }
      }
    })

    // claim=1 is what tells the page to say "set up your account" rather than
    // "reset your password". It only changes wording - the server decides what
    // actually happens from the account's own state, not from this parameter.
    // The link goes to the address on the account, not to whatever casing was typed.
    const resetUrl =
      `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}` +
      (claiming ? '&claim=1' : '')

    // Not awaited: the response must not take longer for a real account than for
    // an unknown one. Failures are reported to Sentry; the caller still gets the
    // generic answer either way.
    const delivery = claiming
      ? sendAccountClaimEmail(user.email, user.firstName || 'there', resetUrl, { expiresAt })
      : sendPasswordResetEmail(user.email, user.firstName || 'User', resetUrl, { expiresAt })
    void Promise.resolve(delivery)
      .then(result => {
        if (result && result.success === false) {
          Sentry.captureMessage("Password reset email could not be sent", {
            level: "error",
            extra: { userId: user.id, claiming, error: result.error },
          })
        }
      })
      .catch(error => {
        Sentry.captureException(error, { extra: { userId: user.id, claiming } })
      })

    return NextResponse.json(GENERIC_ANSWER, { status: 200 })

  } catch (error: any) {
    console.error("Forgot password error:", error)

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    Sentry.captureException(error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
