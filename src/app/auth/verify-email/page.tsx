'use client'

import { Suspense } from 'react'
import { TokenResult } from '../token-result'

const success = () => 'Your email address is verified and your account is active. You can sign in now.'

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
