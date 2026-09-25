import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { listInvitableMembers } from '@/lib/member-invitations'
import { INVITATION_LINK_DAYS } from '@/lib/basa-emails'
import { InvitationsTable } from './invitations-table'

export const dynamic = 'force-dynamic'

/**
 * Active members who have never set a password: imported from WordPress, or
 * activated by staff. An invitation emails them a link to set one; the admin
 * layout's sign-in gate applies.
 */
export default async function MemberInvitationsPage() {
  const { pending, setUp } = await listInvitableMembers()
  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-8 space-y-6">
      <Link href="/admin/members" className="inline-flex items-center text-sm text-blue-800 hover:underline">
        <ArrowLeft className="mr-1 h-4 w-4" /> Members
      </Link>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Account invitations</h1>
        <p className="text-sm text-gray-600 mt-1">
          Active members who have not set a password yet. Until they do, they are treated as guests at checkout.
          An invitation emails a link to set a password; it works for {INVITATION_LINK_DAYS} days, and sending
          again replaces the earlier link. {setUp} active member{setUp === 1 ? ' has' : 's have'} already set up their account.
        </p>
      </div>
      <InvitationsTable
        members={pending.map(m => ({ ...m, renewalDate: m.renewalDate?.toISOString() ?? null, lastInvitedAt: m.lastInvitedAt?.toISOString() ?? null }))}
      />
    </div>
  )
}
