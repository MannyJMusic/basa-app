import { NextRequest, NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { confirmEmailChange, EmailChangeError } from '@/lib/email-change'

/**
 * POST { token }: apply a pending email change from the link sent to the new
 * address. Public (the link is the credential), single use; signs out every
 * session on the account.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  try {
    const { email } = await confirmEmailChange(body?.token)
    return NextResponse.json({ email })
  } catch (error) {
    if (error instanceof EmailChangeError) return NextResponse.json({ error: error.message }, { status: error.status })
    Sentry.captureException(error)
    return NextResponse.json({ error: 'Could not confirm the change' }, { status: 500 })
  }
}
