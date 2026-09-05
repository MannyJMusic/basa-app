import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin, requireSession, isResponse } from '@/lib/api-auth'

// GET /api/resources - Get all resources
export async function GET(request: NextRequest) {
  try {
    const session = await requireSession()
    if (isResponse(session)) return session

    const resources = await prisma.resource.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      include: {
        member: {
          select: {
            id: true,
            businessName: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(resources)
  } catch (error) {
    console.error('Error fetching resources:', error)
    return NextResponse.json(
      { error: 'Failed to fetch resources' },
      { status: 500 }
    )
  }
}

// POST /api/resources - Create a new resource (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin()
    if (isResponse(session)) return session

    const body = await request.json()
    
    const resource = await prisma.resource.create({
      data: {
        title: body.title,
        description: body.description,
        fileUrl: body.fileUrl,
        fileType: body.fileType,
        fileSize: body.fileSize,
        category: body.category,
        tags: body.tags,
        memberId: body.memberId,
        isActive: body.isActive ?? true,
      },
    })

    return NextResponse.json(resource, { status: 201 })
  } catch (error) {
    console.error('Error creating resource:', error)
    return NextResponse.json(
      { error: 'Failed to create resource' },
      { status: 500 }
    )
  }
} 