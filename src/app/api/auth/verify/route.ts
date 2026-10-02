import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

/**
 * Confirm an email address from a verification link.
 *
 * Only an account waiting for exactly this (`PENDING_VERIFICATION`) is activated.
 * A valid token on any other account - deactivated by staff, suspended, or in the
 * unclaimed state imported members are in - confirms the address and nothing more:
 * a leftover link must never switch an account back on.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    const token = body?.token
    // Must be a plain string: an object here would reach Prisma as a filter
    // (`{ not: "" }` matches any pending token).
    if (typeof token !== "string" || token.length < 16 || token.length > 200) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { verificationToken: token },
    })

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 })
    }

    if (!user.verificationTokenExpiry || user.verificationTokenExpiry < new Date()) {
      return NextResponse.json({ error: "Token expired" }, { status: 400 })
    }

    const activate = user.accountStatus === "PENDING_VERIFICATION"

    // Scoped by token too, so the link is single-use even if two requests race.
    const spent = await prisma.user.updateMany({
      where: { id: user.id, verificationToken: token },
      data: {
        emailVerified: new Date(),
        verificationToken: null,
        verificationTokenExpiry: null,
        ...(activate ? { isActive: true, accountStatus: "ACTIVE" as const } : {}),
      },
    })
    if (spent.count === 0) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 })
    }

    return NextResponse.json({
      activated: activate,
      message: activate
        ? "Your email address is verified and your account is active. You can sign in now."
        : "Your email address is verified.",
    })
  } catch (error) {
    console.error("Verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
