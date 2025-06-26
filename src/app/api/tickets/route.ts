import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/tickets - Get support ticket audit logs
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supportLogs = await prisma.auditLog.findMany({
      where: {
        action: {
          in: ['SUPPORT_TICKET_CREATED', 'SUPPORT_TICKET_UPDATED', 'SUPPORT_TICKET_CLOSED']
        },
        userId: session.user.id
      },
      orderBy: { timestamp: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    return NextResponse.json(supportLogs)
  } catch (error) {
    console.error('Error fetching support tickets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch support tickets' },
      { status: 500 }
    )
  }
}

// POST /api/tickets - Create a new support ticket
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Create audit log for support ticket
    const supportTicket = await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'SUPPORT_TICKET_CREATED',
        entityType: 'SUPPORT_TICKET',
        entityId: `ticket_${Date.now()}`,
        newValues: {
          title: body.title,
          description: body.description,
          priority: body.priority || 'medium',
          status: body.status || 'open',
          category: body.category,
          timestamp: new Date().toISOString()
        },
      },
    })

    return NextResponse.json(supportTicket, { status: 201 })
  } catch (error) {
    console.error('Error creating support ticket:', error)
    return NextResponse.json(
      { error: 'Failed to create support ticket' },
      { status: 500 }
    )
  }
} 