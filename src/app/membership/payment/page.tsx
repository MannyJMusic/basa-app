import { permanentRedirect } from 'next/navigation'

/** The old two-step checkout. Payment now happens on Stripe Checkout from /membership/join. */
export default function Page() {
  permanentRedirect('/membership/join')
}
