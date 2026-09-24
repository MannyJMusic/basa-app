import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * GET /api/tickets/by-payment?paymentId=pi_…
 *
 * The payment success page only knows the PaymentIntent id Stripe returned to the
 * browser. This turns it into the ticket link. A PaymentIntent id is itself an
 * unguessable secret held by the buyer, so answering with the ticket token for it
 * gives away nothing the buyer did not already have.
 */
export async function GET(request: NextRequest) {
  const paymentId = request.nextUrl.searchParams.get('paymentId') ?? ''
  if (!/^pi_[A-Za-z0-9]{10,}$/.test(paymentId)) {
    return NextResponse.json({ error: 'paymentId required' }, { status: 400 })
  }
  const reg = await prisma.eventRegistration.findUnique({
    where: { paymentIntentId: paymentId },
    select: {
      ticketToken: true, status: true, event: { select: { slug: true, title: true } },
      memberRateRequest: { select: { status: true, heldCents: true, memberCents: true } },
    },
  })
  if (!reg?.ticketToken) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(
    { token: reg.ticketToken, status: reg.status, event: reg.event, memberRate: reg.memberRateRequest },
    { headers: { 'cache-control': 'no-store' } },
  )
}
