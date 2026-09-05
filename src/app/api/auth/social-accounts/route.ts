import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireSession, isResponse } from "@/lib/api-auth"

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession()
    if (isResponse(session)) return session

    const accounts = await prisma.account.findMany({
      where: {
        userId: session.user.id
      },
      select: {
        id: true,
        provider: true,
        providerAccountId: true,
        user: {
          select: {
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      accounts: accounts.map(account => ({
        id: account.id,
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        email: account.user.email
      }))
    })

  } catch (error) {
    console.error("Error fetching social accounts:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 