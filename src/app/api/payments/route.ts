import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin, isResponse } from '@/lib/api-auth'

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
