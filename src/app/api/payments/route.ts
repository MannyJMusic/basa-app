import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin, requireSession, isResponse } from '@/lib/api-auth'

// GET /api/payments - Get payment audit logs (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await requireAdmin()
    if (isResponse(session)) return session

    const paymentLogs = await prisma.auditLog.findMany({
      where: {
        action: {
          in: ['EVENT_PAYMENT_COMPLETED', 'MEMBERSHIP_PAYMENT_COMPLETED']
        }
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

    return NextResponse.json(paymentLogs)
  } catch (error) {
    console.error('Error fetching payment logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment logs' },
      { status: 500 }
    )
  }
}

// POST /api/payments - Create a payment audit log
export async function POST(request: NextRequest) {
  try {
    const session = await requireSession()
    if (isResponse(session)) return session

    const body = await request.json()
    
    // Create audit log for payment
    const paymentLog = await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'PAYMENT_CREATED',
        entityType: 'PAYMENT',
        entityId: body.paymentIntentId || 'manual',
        newValues: {
          amount: body.amount,
          currency: body.currency || 'USD',
          status: body.status || 'pending',
          paymentMethod: body.paymentMethod,
          description: body.description,
          timestamp: new Date().toISOString()
        },
      },
    })

    return NextResponse.json(paymentLog, { status: 201 })
  } catch (error) {
    console.error('Error creating payment log:', error)
    return NextResponse.json(
      { error: 'Failed to create payment log' },
      { status: 500 }
    )
  }
} 