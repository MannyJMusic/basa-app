import type { Metadata } from 'next'
import Link from 'next/link'
import { MEMBERSHIP_SALES_ENABLED } from '@/lib/feature-flags'
import { MembershipOfficeNotice } from '@/components/membership/MembershipOfficeNotice'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { tierFromSlug, MEMBERSHIP_TIERS, tierLabel } from '@/lib/membership-tiers'
import { membershipPurchaseBlock } from '@/lib/membership-purchase'
import JoinForm from './join-form'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Join BASA | Business Association of San Antonio',
  description: 'Become a member of the Business Association of San Antonio online.',
}

const dateFmt = new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeZone: 'America/Chicago' })

/**
 * Online membership purchase. Off (MEMBERSHIP_SALES_ENABLED): how to reach the
 * office. On: one form, then Stripe Checkout for a yearly subscription.
 */
export default async function JoinPage({ searchParams }: { searchParams: Promise<{ tier?: string; canceled?: string }> }) {
  if (!MEMBERSHIP_SALES_ENABLED) return <MembershipOfficeNotice variant="page" intent="join" />

  const { tier, canceled } = await searchParams
  const session = await auth()
  const account = session?.user?.id
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          email: true, firstName: true, lastName: true,
          member: { select: { membershipStatus: true, membershipTier: true, renewalDate: true, subscriptionId: true, businessName: true, businessPhone: true, website: true, businessAddress: true, city: true, state: true, zipCode: true } },
        },
      })
    : null

  const block = account?.member ? membershipPurchaseBlock(account.member) : null
  if (block) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-blue-900 mb-4">You are already a member</h1>
        <p className="text-gray-700 mb-6">
          Your {tierLabel(account!.member!.membershipTier)} membership is active
          {account!.member!.renewalDate ? ` until ${dateFmt.format(account!.member!.renewalDate)}` : ''}. {block}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/dashboard/membership" className="rounded-lg bg-blue-900 px-6 py-2.5 font-semibold text-white hover:bg-blue-800">My membership</Link>
          <MembershipOfficeNotice variant="inline" intent="upgrade" />
        </div>
      </div>
    )
  }

  const initialTier = tierFromSlug(tier) ?? null
  return (
    <JoinForm
      initialTier={initialTier ? MEMBERSHIP_TIERS[initialTier].slug : null}
      canceled={canceled === '1'}
      account={account ? {
        email: account.email ?? '',
        firstName: account.firstName ?? '',
        lastName: account.lastName ?? '',
        businessName: account.member?.businessName ?? '',
        phone: account.member?.businessPhone ?? '',
        website: account.member?.website ?? '',
        businessAddress: account.member?.businessAddress ?? '',
        city: account.member?.city ?? '',
        state: account.member?.state ?? '',
        zipCode: account.member?.zipCode ?? '',
      } : null}
    />
  )
}
