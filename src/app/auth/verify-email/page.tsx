'use client'

import { Suspense } from 'react'
import { TokenResult } from '../token-result'

const success = (data: { message?: string }) => data.message || 'Your email address is verified.'

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <TokenResult
        endpoint="/api/auth/verify"
        titles={{ working: 'Verifying your email…', done: 'Email verified', failed: 'We could not verify this link' }}
        success={success}
      />
    </Suspense>
  )
}
