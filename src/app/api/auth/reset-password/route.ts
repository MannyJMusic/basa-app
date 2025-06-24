import { NextRequest, NextResponse } from "next/server"
import { passwordResetSchema } from "@/lib/validations"
import { hashPassword } from "@/lib/utils"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, password } = passwordResetSchema.parse(body)

    // Find user by reset token (you'll need to implement this based on your token storage)
    // For now, we'll use a placeholder approach
    const user = await prisma.user.findFirst({
      where: {
        // Add your token fields here
        // resetToken: token,
        // resetTokenExpiry: { gt: new Date() }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedPassword = await hashPassword(password)

    // Update user password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        hashedPassword,
        // resetToken: null,
        // resetTokenExpiry: null,
      }
    })

    // Log password reset
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "PASSWORD_RESET_COMPLETED",
        entityType: "USER",
        entityId: user.id,
        newValues: {
          timestamp: new Date().toISOString()
        }
      }
    })

    return NextResponse.json(
      { message: "Password reset successfully" },
      { status: 200 }
    )

  } catch (error: any) {
    console.error("Reset password error:", error)
    
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 