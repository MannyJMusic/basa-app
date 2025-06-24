import { NextRequest, NextResponse } from "next/server"
import { registerSchema } from "@/lib/validations"
import { hashPassword } from "@/lib/utils"
import { prisma } from "@/lib/db"
import { sendWelcomeEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, firstName, lastName, phone } = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        hashedPassword,
        firstName,
        lastName,
        phone,
        role: "MEMBER",
        isVerified: false,
        isActive: true
      }
    })

    // Log user creation
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "USER_CREATED",
        entityType: "USER",
        entityId: user.id,
        newValues: {
          email,
          firstName,
          lastName,
          role: "MEMBER"
        }
      }
    })

    // Send welcome email using Mailgun
    try {
      await sendWelcomeEmail(email, firstName)
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError)
      // Don't fail the registration if email fails
    }

    return NextResponse.json(
      { 
        message: "User registered successfully",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      },
      { status: 201 }
    )

  } catch (error: any) {
    console.error("Registration error:", error)
    
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