import { NextRequest, NextResponse } from "next/server"
import { passwordResetSchema } from "@/lib/validations"
import { hashPassword } from "@/lib/utils"
import { prisma } from "@/lib/db"

/**
 * Complete a password reset.
 *
 * The token is the only thing standing between a caller and somebody's account:
 * this route is public, and `middleware.ts` does not run on `/api/*` at all. It
 * must be matched exactly, it must still be in date, and it must be spent on use
 * so a link that leaks from an inbox or browser history cannot be replayed.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, password } = passwordResetSchema.parse(body)

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      )
    }

    const hashedPassword = await hashPassword(password)

    // Clearing the token in the same update is what makes it single-use. Scoping
    // the update by token as well means two requests racing the same link cannot
    // both succeed - the second matches no row.
    const spent = await prisma.user.updateMany({
      where: { id: user.id, resetToken: token },
      data: {
        hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    })

    if (spent.count === 0) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      )
    }

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
