import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Verify the account belongs to the user
    const account = await prisma.account.findFirst({
      where: {
        id: params.id,
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
        id: params.id
      }
    })

    // Log the disconnection
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "SOCIAL_ACCOUNT_DISCONNECTED",
        entityType: "ACCOUNT",
        entityId: params.id,
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