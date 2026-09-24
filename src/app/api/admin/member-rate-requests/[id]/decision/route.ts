import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import * as Sentry from '@sentry/nextjs'
import { requireAdmin, isResponse } from '@/lib/api-auth'
import { decideMemberRateRequest, MemberRateRequestError } from '@/lib/member-rate-requests'

const bodySchema = z.object({
  decision: z.enum(['approve', 'deny']),
  note: z.string().trim().max(500).optional(),
}).strict()

/**
 * POST /api/admin/member-rate-requests/:id/decision  { decision: 'approve' | 'deny', note? }
 *
 * Approve captures the member total from the card hold; deny captures the whole
 * hold (the non-member rate). A request is decided once: a second click, or a
 * second admin, gets a 409 naming what already happened.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (isResponse(session)) return session
  const { id } = await params

  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Choose approve or deny' }, { status: 400 })

  return Sentry.startSpan({ op: 'http.server', name: 'POST /api/admin/member-rate-requests/:id/decision' }, async span => {
    span.setAttribute('decision', parsed.data.decision)
    try {
      const result = await decideMemberRateRequest(id, parsed.data.decision, session.user.id, parsed.data.note)
      return NextResponse.json(result)
    } catch (error) {
      if (error instanceof MemberRateRequestError) {
        return NextResponse.json({ error: error.message }, { status: error.status })
      }
      Sentry.captureException(error)
      return NextResponse.json({ error: 'Could not record the decision' }, { status: 500 })
    }
  })
}
