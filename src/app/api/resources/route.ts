import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { requireAdmin, requireSession, isResponse } from '@/lib/api-auth'

const createResourceSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(5000).nullish(),
  fileUrl: z.string().trim().url().max(1000).refine(u => /^https?:\/\//i.test(u), 'fileUrl must be http(s)').nullish(),
  fileType: z.string().trim().max(100).nullish(),
  fileSize: z.number().int().min(0).nullish(),
  category: z.string().trim().max(100).nullish(),
  tags: z.array(z.string().trim().max(50)).max(20).optional(),
  memberId: z.string().max(50).nullish(),
  isActive: z.boolean().default(true),
}).strict()

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

    const parsed = createResourceSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? 'Invalid resource' },
        { status: 400 }
      )
    }

    const resource = await prisma.resource.create({ data: parsed.data })

    return NextResponse.json(resource, { status: 201 })
  } catch (error) {
    console.error('Error creating resource:', error)
    return NextResponse.json(
      { error: 'Failed to create resource' },
      { status: 500 }
    )
  }
} 