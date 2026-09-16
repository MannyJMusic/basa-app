import { MEMBERSHIP_SALES_ENABLED } from '@/lib/feature-flags'
import { MembershipOfficeNotice } from '@/components/membership/MembershipOfficeNotice'
import JoinWizard from './join-wizard'

export const dynamic = 'force-dynamic'

/**
 * Online membership sales are gated (MEMBERSHIP_SALES_ENABLED). Off: how to reach
 * the office. On: the multi-step join wizard, which is a client component.
 */
export default function JoinPage() {
  if (!MEMBERSHIP_SALES_ENABLED) return <MembershipOfficeNotice variant="page" intent="join" />
  return <JoinWizard />
}
