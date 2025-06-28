import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    const guestUser = await prisma.user.findUnique({
      where: { email: 'guest@test.com' },
      include: {
        member: true
      }
    })

    if (!guestUser) {
      return NextResponse.json({ error: "Guest user not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Debug info",
      session: session ? {
        userId: session.user.id,
        email: session.user.email,
        role: session.user.role,
        isActive: session.user.isActive,
        accountStatus: session.user.accountStatus,
      } : null,
      guestUser: {
        id: guestUser.id,
        email: guestUser.email,
        firstName: guestUser.firstName,
        lastName: guestUser.lastName,
        role: guestUser.role,
        isActive: guestUser.isActive,
        accountStatus: guestUser.accountStatus,
        hasMemberRecord: !!guestUser.member,
        memberData: guestUser.member
      }
    })
  } catch (error) {
    console.error("Debug error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 