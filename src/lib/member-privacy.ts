import type { Prisma } from "@prisma/client"

/**
 * What the member directory may show to another signed-in member (2026-09-22
 * audit, H-A5). The member endpoints used to `include` whole rows, so any
 * session could read account emails, last-login times, Stripe ids and the buyer
 * details, payment intent and ticket token of each member's registrations.
 *
 * Admins get `adminMemberSelect`; everyone else gets `directoryMemberSelect`
 * passed through `applyMemberPrivacy`, which honours the member's own
 * `allowContact` and `showAddress` choices.
 */

/** A member's event history: what they attended, never the buyer/payment row. */
const registrationSummarySelect = {
  id: true,
  status: true,
  event: {
    select: { id: true, title: true, startDate: true, status: true },
  },
} satisfies Prisma.EventRegistrationSelect

export const directoryMemberSelect = {
  id: true,
  userId: true,
  businessName: true,
  businessType: true,
  industry: true,
  yearEstablished: true,
  numberOfEmployees: true,
  businessEmail: true,
  businessPhone: true,
  businessAddress: true,
  city: true,
  state: true,
  zipCode: true,
  website: true,
  membershipTier: true,
  membershipStatus: true,
  joinedAt: true,
  logo: true,
  coverImage: true,
  description: true,
  tagline: true,
  specialties: true,
  certifications: true,
  linkedin: true,
  facebook: true,
  instagram: true,
  twitter: true,
  youtube: true,
  showInDirectory: true,
  allowContact: true,
  showAddress: true,
  user: {
    select: { id: true, firstName: true, lastName: true, email: true, role: true },
  },
  eventRegistrations: {
    select: registrationSummarySelect,
    orderBy: { createdAt: "desc" },
  },
} satisfies Prisma.MemberSelect

export const adminMemberSelect = {
  ...directoryMemberSelect,
  ein: true,
  annualRevenue: true,
  renewalDate: true,
  stripeCustomerId: true,
  subscriptionId: true,
  newsletterSubscribed: true,
  membershipPaymentConfirmed: true,
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      isActive: true,
      accountStatus: true,
      lastLogin: true,
      createdAt: true,
      updatedAt: true,
    },
  },
} satisfies Prisma.MemberSelect

type DirectoryMember = Prisma.MemberGetPayload<{ select: typeof directoryMemberSelect }>

/**
 * Blank the contact and address fields a member has not agreed to share. The
 * member always sees their own row in full.
 */
export function applyMemberPrivacy(member: DirectoryMember, viewerId: string): DirectoryMember {
  if (member.userId === viewerId) return member
  return {
    ...member,
    ...(member.allowContact
      ? {}
      : { businessEmail: null, businessPhone: null }),
    ...(member.showAddress ? {} : { businessAddress: null, zipCode: null }),
    user: {
      ...member.user,
      // The login address is only a fallback contact, and only with consent.
      email: member.allowContact ? member.user.email : null,
    },
  }
}
