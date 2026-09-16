import Link from 'next/link'
import { Mail, Phone } from 'lucide-react'
import { OFFICE_CONTACT } from '@/lib/feature-flags'

interface MembershipOfficeNoticeProps {
  /** `page` fills a whole route (join, payment); `card` sits inside a listing; `inline` is one line under a tier. */
  variant?: 'page' | 'card' | 'inline'
  /** What the visitor was trying to do, for the heading. */
  intent?: 'join' | 'renew' | 'upgrade'
}

/**
 * Shown wherever the site would otherwise sell a membership while online sales
 * are switched off (MEMBERSHIP_SALES_ENABLED). Pure server component: no hooks,
 * so it can render from server pages and be passed into client components.
 */
export function MembershipOfficeNotice({ variant = 'card', intent = 'join' }: MembershipOfficeNoticeProps) {
  const verb = intent === 'renew' ? 'renew' : intent === 'upgrade' ? 'upgrade' : 'join'

  if (variant === 'inline') {
    return (
      <p className="text-sm text-gray-600">
        To {verb}, call {OFFICE_CONTACT.name} at{' '}
        <a href={OFFICE_CONTACT.phoneHref} className="font-medium text-blue-700 underline">{OFFICE_CONTACT.phone}</a> or email{' '}
        <a href={`mailto:${OFFICE_CONTACT.email}`} className="font-medium text-blue-700 underline">{OFFICE_CONTACT.email}</a>.
      </p>
    )
  }

  const body = (
    <>
      <p className="text-gray-700 leading-relaxed">
        Memberships are handled by the BASA office right now. To {verb}, call {OFFICE_CONTACT.name} at{' '}
        <a href={OFFICE_CONTACT.phoneHref} className="font-semibold text-blue-700 underline">{OFFICE_CONTACT.phone}</a>{' '}
        or email{' '}
        <a href={`mailto:${OFFICE_CONTACT.email}`} className="font-semibold text-blue-700 underline">{OFFICE_CONTACT.email}</a>.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <a
          href={OFFICE_CONTACT.phoneHref}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-900 px-5 py-2.5 text-white font-semibold hover:bg-blue-800"
        >
          <Phone className="h-4 w-4" /> Call {OFFICE_CONTACT.phone}
        </a>
        <a
          href={`mailto:${OFFICE_CONTACT.email}?subject=BASA%20membership`}
          className="inline-flex items-center gap-2 rounded-lg border border-blue-900 px-5 py-2.5 text-blue-900 font-semibold hover:bg-blue-50"
        >
          <Mail className="h-4 w-4" /> Email the office
        </a>
      </div>
      <p className="mt-4 text-xs text-gray-500">
        Digital membership purchase and account management are coming soon.
      </p>
    </>
  )

  if (variant === 'page') {
    return (
      <main className="min-h-[60vh] bg-gray-50 py-16 px-4">
        <div className="mx-auto max-w-2xl rounded-2xl border bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            {intent === 'renew' ? 'Renew your BASA membership' : 'Join BASA'}
          </h1>
          {body}
          <p className="mt-6 text-sm">
            <Link href="/membership" className="text-blue-700 underline">See what each membership includes</Link>
            {' · '}
            <Link href="/events" className="text-blue-700 underline">Browse upcoming events</Link>
          </p>
        </div>
      </main>
    )
  }

  return (
    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {intent === 'upgrade' ? 'Want to change your membership?' : 'Ready to join?'}
      </h3>
      {body}
    </div>
  )
}
