'use client'

import { Suspense } from 'react'
import { TokenResult } from '../token-result'

const success = (d: { email?: string }) =>
  `Your email address is now ${d.email ?? 'changed'}. For security you have been signed out everywhere; sign in with the new address.`

export default function ConfirmEmailPage() {
  return (
    <Suspense>
      <TokenResult
        endpoint="/api/auth/confirm-email"
        titles={{ working: 'Confirming your new email…', done: 'Email address changed', failed: 'We could not confirm this change' }}
        success={success}
      />
    </Suspense>
  )
}
