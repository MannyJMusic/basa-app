import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import * as Sentry from '@sentry/nextjs'
import { requireAdmin, isResponse } from '@/lib/api-auth'
import { listInvitableMembers, sendInvitations } from '@/lib/member-invitations'

/** GET: active members whose account has no password yet, with invitation history. */
export async function GET() {
  const session = await requireAdmin()
  if (isResponse(session)) return session
  return NextResponse.json(await listInvitableMembers())
}

const bodySchema = z.object({ userIds: z.array(z.string().min(1)).min(1).max(100) }).strict()

/**
 * POST { userIds }: email each an account-setup link. The server re-checks every id
 * (active membership, account never set up); anything else is reported as skipped.
 */
export async function POST(request: NextRequest) {
  const session = await requireAdmin()
  if (isResponse(session)) return session
  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Choose between 1 and 100 members' }, { status: 400 })

  return Sentry.startSpan({ op: 'http.server', name: 'POST /api/admin/members/invitations' }, async span => {
    const results = await sendInvitations(parsed.data.userIds, session.user.id)
    span.setAttribute('invitations.sent', results.filter(r => r.status === 'sent').length)
    return NextResponse.json({ results })
  })
}
