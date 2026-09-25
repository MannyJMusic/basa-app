'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

/**
 * Shared by /auth/verify-email and /auth/confirm-email: posts the link's token to
 * its API once and shows what actually happened. /auth/verify-email used to be a
 * static "verified" page that never called /api/auth/verify at all.
 */
export function TokenResult({ endpoint, titles, success }: {
  endpoint: string
  titles: { working: string; done: string; failed: string }
  success: (data: { email?: string }) => string
}) {
  const token = useSearchParams().get('token')
  const [state, setState] = useState<{ kind: 'working' } | { kind: 'done'; message: string } | { kind: 'failed'; message: string }>({ kind: 'working' })
  const sent = useRef(false)

  useEffect(() => {
    if (sent.current) return
    sent.current = true
    if (!token) { setState({ kind: 'failed', message: 'This link is missing its code. Open the link from your email again.' }); return }
    fetch(endpoint, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token }) })
      .then(async res => {
        const json = await res.json().catch(() => ({}))
        if (res.ok) setState({ kind: 'done', message: success(json) })
        else setState({ kind: 'failed', message: json.error || 'This link is not valid.' })
      })
      .catch(() => setState({ kind: 'failed', message: 'Could not reach the server. Try the link again.' }))
  }, [endpoint, success, token])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {state.kind === 'working' && <Loader2 className="h-5 w-5 animate-spin text-gray-500" />}
            {state.kind === 'done' && <CheckCircle2 className="h-5 w-5 text-green-600" />}
            {state.kind === 'failed' && <XCircle className="h-5 w-5 text-red-600" />}
            {state.kind === 'working' ? titles.working : state.kind === 'done' ? titles.done : titles.failed}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {state.kind !== 'working' && <p className="text-gray-700">{state.message}</p>}
          {state.kind !== 'working' && (
            <div className="flex flex-wrap gap-3">
              <Button asChild><Link href="/auth/sign-in">Sign in</Link></Button>
              {state.kind === 'failed' && <Button asChild variant="outline"><Link href="/auth/forgot-password">Forgot password</Link></Button>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
