import { NextRequest, NextResponse } from "next/server"
import { passwordResetRequestSchema } from "@/lib/validations"
import { prisma } from "@/lib/db"
import { sendPasswordResetEmail, sendAccountClaimEmail } from "@/lib/basa-emails"
import { isUnclaimedLegacyAccount } from "@/lib/account-claim"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = passwordResetRequestSchema.parse(body)

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json(
        { message: "If an account with that email exists, a password reset link has been sent." },
        { status: 200 }
      )
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Update user with reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry
      }
    })

    // A member imported from WordPress has no password to reset, so "reset your
    // password" is the wrong thing to send them - that was the dishonest answer #104
    // was filed about. Same token, same expiry, different wording, and completing it
    // activates the account.
    const claiming = isUnclaimedLegacyAccount(user)

    // claim=1 is what tells the page to say "set up your account" rather than
    // "reset your password". It only changes wording - the server decides what
    // actually happens from the account's own state, not from this parameter.
    const resetUrl =
      `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}` +
      (claiming ? '&claim=1' : '')
    try {
      if (claiming) {
        await sendAccountClaimEmail(email, user.firstName || 'there', resetUrl)
      } else {
        await sendPasswordResetEmail(email, user.firstName || 'User', resetUrl)
      }
    } catch (emailError) {
      console.error("Failed to send account email:", emailError)
      return NextResponse.json(
        { error: "Failed to send password reset email" },
        { status: 500 }
      )
    }

    // Log password reset request
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

    return NextResponse.json(
      { message: "If an account with that email exists, a password reset link has been sent." },
      { status: 200 }
    )

  } catch (error: any) {
    console.error("Forgot password error:", error)
    
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 