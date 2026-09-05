import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireSession, isResponse } from "@/lib/api-auth"

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession()
    if (isResponse(session)) return session

    const body = await request.json()
    const { imageUrl } = body

    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 })
    }

    // Update user's image
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { image: imageUrl }
    })

    return NextResponse.json({ 
      success: true, 
      message: "Image updated successfully",
      user: {
        id: updatedUser.id,
        image: updatedUser.image
      }
    })
  } catch (error) {
    console.error("Error updating image:", error)
    return NextResponse.json(
      { error: "Failed to update image" },
      { status: 500 }
    )
  }
} 