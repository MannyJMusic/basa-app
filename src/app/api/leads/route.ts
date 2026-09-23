import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin, isResponse } from '@/lib/api-auth'

// GET /api/leads - Get all leads (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await requireAdmin()
    if (isResponse(session)) return session

    const leads = await prisma.lead.findMany({
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

    return NextResponse.json(leads)
  } catch (error) {
    console.error('Error fetching leads:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    )
  }
}
