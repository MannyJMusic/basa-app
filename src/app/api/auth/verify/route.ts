import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()
    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 })
    }

    // Find user by verification token
    const user = await prisma.user.findFirst({
      where: { verificationToken: token },
    })

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 })
    }

    // Check if token is expired
    if (!user.verificationTokenExpiry || user.verificationTokenExpiry < new Date()) {
      return NextResponse.json({ error: "Token expired" }, { status: 400 })
    }

    // Activate user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isActive: true,
        accountStatus: "ACTIVE",
        emailVerified: new Date(),
        verificationToken: null,
        verificationTokenExpiry: null,
      },
    })

    return NextResponse.json({ message: "Account verified successfully" })
  } catch (error) {
    console.error("Verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 