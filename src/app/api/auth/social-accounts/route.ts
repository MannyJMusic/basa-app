import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

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