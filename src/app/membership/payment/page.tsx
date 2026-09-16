import { MEMBERSHIP_SALES_ENABLED } from '@/lib/feature-flags'
import { MembershipOfficeNotice } from '@/components/membership/MembershipOfficeNotice'
import MembershipPaymentWizard from './payment-wizard'

export const dynamic = 'force-dynamic'

export default function MembershipPaymentPage() {
  if (!MEMBERSHIP_SALES_ENABLED) return <MembershipOfficeNotice variant="page" intent="join" />
  return <MembershipPaymentWizard />
}
