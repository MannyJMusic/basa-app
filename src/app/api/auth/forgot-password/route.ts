import { NextRequest, NextResponse } from "next/server"
import { passwordResetRequestSchema } from "@/lib/validations"
import { prisma } from "@/lib/db"
import { sendPasswordResetEmail } from "@/lib/email"
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

    // Create reset URL
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`

    // Send password reset email using Mailgun
    try {
      await sendPasswordResetEmail(email, user.firstName, resetToken)
    } catch (emailError) {
      console.error("Failed to send password reset email:", emailError)
      return NextResponse.json(
        { error: "Failed to send password reset email" },
        { status: 500 }
      )
    }

    // Log password reset request
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "PASSWORD_RESET_REQUESTED",
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