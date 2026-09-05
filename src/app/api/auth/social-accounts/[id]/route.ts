import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireSession, isResponse } from "@/lib/api-auth"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession()
    if (isResponse(session)) return session
    const { id } = await params

    // Verify the account belongs to the user
    const account = await prisma.account.findFirst({
      where: {
        id: id,
        userId: session.user.id
      }
    })

    if (!account) {
      return NextResponse.json(
        { error: "Account not found" },
        { status: 404 }
      )
    }

    // Delete the account
    await prisma.account.delete({
      where: {
        id: id
      }
    })

    // Log the disconnection
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "SOCIAL_ACCOUNT_DISCONNECTED",
        entityType: "ACCOUNT",
        entityId: id,
        newValues: {
          provider: account.provider,
          timestamp: new Date().toISOString()
        }
      }
    })

    return NextResponse.json({
      message: "Social account disconnected successfully"
    })

  } catch (error) {
    console.error("Error disconnecting social account:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 