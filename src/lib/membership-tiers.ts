import type { MembershipTier } from "@prisma/client"

/**
 * BASA membership levels, from "BASA Membership Levels - 10.01.2026" and the
 * membership contract of the same date. Owner decisions (2026-10-02):
 * Sponsorship is $3,900 (the contract form's $995 is out of date), and online
 * purchases are a yearly Stripe subscription that renews until the member
 * cancels, as the contract says. There are no chapters in this scheme.
 *
 * Prices here are the only source of truth for what the site charges.
 */
export interface TierDefinition {
  tier: MembershipTier
  /** Identifier used in URLs, forms, Stripe metadata and admin payloads. */
  slug: string
  /** Short name, as printed on the levels sheet ("Meeting"). */
  name: string
  /** Full label ("Meeting Member"). */
  label: string
  /** Yearly price in cents. */
  priceCents: number
  /** Employees covered at member event rates, as the sheet words it. */
  eventCoverage: string
  benefits: string[]
  /** May be paid monthly by arrangement with the office (not online). */
  monthlyByArrangement: boolean
  /** Shown as the suggested choice on the levels page. */
  highlighted?: boolean
}

const COMMON_START = [
  "Lanyard – name tag to wear at BASA events",
]
const COMMON_END = [
  "Receive BASA Benefits from fellow members",
  "Opportunity to provide a BASA Benefit to your fellow members",
]

export const MEMBERSHIP_TIERS: Record<MembershipTier, TierDefinition> = {
  MEETING_MEMBER: {
    tier: "MEETING_MEMBER",
    slug: "meeting",
    name: "Meeting",
    label: "Meeting Member",
    priceCents: 35000,
    eventCoverage: "Special rates at BASA networking events for one employee",
    monthlyByArrangement: false,
    benefits: [
      "Special rates at BASA networking events for one employee",
      ...COMMON_START,
      "Directory listing on the BASA website",
      "New Member “Bundle Bag”",
      "Opportunity to provide marketing materials for the Bundle Bag",
      "1 shared e-blast per month (you provide the content)",
      "1 social media post per month (you provide the content)",
      ...COMMON_END,
      "Membership certificate",
    ],
  },
  MARKET_MEMBER: {
    tier: "MARKET_MEMBER",
    slug: "market",
    name: "Market",
    label: "Market Member",
    priceCents: 65000,
    eventCoverage: "Special rates at BASA networking events for one employee",
    monthlyByArrangement: false,
    benefits: [
      "Special rates at BASA networking events for one employee",
      ...COMMON_START,
      "One ribbon cutting (scheduled in the first 6 months of membership)",
      "Directory listing on the BASA website",
      "New Member “Bundle Bag”",
      "Opportunity to provide marketing materials for the Bundle Bag",
      "1 shared e-blast per month (you provide the content)",
      "2 social media posts per month (you provide the content)",
      "1 video post on social media per month (you provide the content)",
      ...COMMON_END,
      "Membership certificate",
    ],
  },
  ACTION_MEMBER: {
    tier: "ACTION_MEMBER",
    slug: "action",
    name: "Action",
    label: "Action Member",
    priceCents: 95000,
    eventCoverage: "Special rates at BASA networking events for two employees",
    monthlyByArrangement: false,
    highlighted: true,
    benefits: [
      "Special rates at BASA networking events for two employees",
      ...COMMON_START,
      "Bring a guest to a BASA event at the member rate",
      "Directory listing on the BASA website",
      "New Member “Bundle Bag”",
      "Opportunity to provide marketing materials for the Bundle Bag",
      "Welcome post on social media with photos and stories or flyer",
      "2 shared e-blasts per month (you provide the content)",
      "2 social media posts per month (you provide the content)",
      "1 video post on social media per month (you provide the content)",
      "Host a “Member Rally” or one ribbon cutting (scheduled in the first 6 months)",
      "Opportunity to set up a table at selected BASA events",
      ...COMMON_END,
      "The BASA Channel – up to 4 episodes",
      "Membership certificate",
    ],
  },
  MIXER_MEMBER: {
    tier: "MIXER_MEMBER",
    slug: "mixer",
    name: "Mixer",
    label: "Mixer Member",
    priceCents: 199000,
    eventCoverage: "Monthly mixers (3 per month) included for two employees, or one employee and a guest",
    monthlyByArrangement: true,
    benefits: [
      "Monthly mixers (3 per month) included for two employees, or one employee and a guest",
      ...COMMON_START,
      "Directory listing on the BASA website with a link to your site",
      "New Member “Bundle Bag”",
      "Opportunity to provide marketing materials for the Bundle Bag",
      "Welcome post on social media with photo",
      "4 shared e-blasts per month (you provide the content)",
      "4 social media posts per month (you provide the content)",
      "2 video posts on social media per month (you provide the content)",
      "Opportunity to host a “Member Rally”",
      "One ribbon cutting (scheduled in the first 6 months of membership)",
      "Opportunity to set up a table at selected BASA events",
      ...COMMON_END,
      "The BASA Channel – up to 6 episodes",
      "Membership certificate",
    ],
  },
  SPONSORSHIP_MEMBER: {
    tier: "SPONSORSHIP_MEMBER",
    slug: "sponsorship",
    name: "Sponsorship",
    label: "Sponsorship Member",
    priceCents: 390000,
    eventCoverage: "Monthly mixers (3 per month) included for two employees, or one employee and a guest",
    monthlyByArrangement: true,
    benefits: [
      "Monthly mixers (3 per month) included for two employees, or one employee and a guest",
      ...COMMON_START,
      "Sponsor of the Golf Tournament (table and signage)",
      "Sponsor of the Bowling Tournament (table and signage)",
      "Sponsor of mixers – signage onsite representing your business",
      "Two-minute speech about your business at mixers (when attending)",
      "Directory listing on the BASA website with a link to your site",
      "New Member “Bundle Bag”",
      "Opportunity to provide marketing materials for the Bundle Bag",
      "Welcome post on social media with photo",
      "4 shared e-blasts per month (you provide the content)",
      "4 social media posts per month (you provide the content)",
      "2 video posts on social media per month (you provide the content)",
      "Opportunity to host a “Member Rally”",
      "Ribbon cutting at your business (scheduled in the first 6 months)",
      ...COMMON_END,
      "The BASA Channel – up to 10 episodes",
      "Membership certificate",
    ],
  },
}

/** Footnotes from the levels sheet, shown wherever the levels are listed. */
export const MEMBERSHIP_NOTES = [
  "Sponsorships may be adjusted based on when the business joins BASA.",
  "The BASA Channel can be added to any membership for $400 per month, with quarterly payment options. Contact the office to add it.",
  "Mixer and Sponsorship members can arrange to pay monthly. Contact the office to set that up.",
] as const

/** The contract's terms, which a buyer accepts before paying online. */
export const MEMBERSHIP_TERMS = [
  "Your membership renews automatically every year on the date you join, at the same price, until you cancel.",
  "You are protected from any rate increase or package change for the duration of your membership.",
  "You can cancel any time from your member dashboard; the membership stays active until the end of the year you have paid for.",
  "Meltdown Media, LLC / BASA is not responsible for errors in ads provided by members, or in ads members have proofed and approved for digital distribution.",
] as const

export const MEMBERSHIP_TIER_VALUES = Object.keys(MEMBERSHIP_TIERS) as [MembershipTier, ...MembershipTier[]]

/** Levels in price order, for listings. */
export const TIERS_IN_ORDER: TierDefinition[] = MEMBERSHIP_TIER_VALUES
  .map(t => MEMBERSHIP_TIERS[t])
  .sort((a, b) => a.priceCents - b.priceCents)

const TIER_BY_SLUG: Record<string, MembershipTier> = Object.fromEntries(
  MEMBERSHIP_TIER_VALUES.map(t => [MEMBERSHIP_TIERS[t].slug, t])
)

export function tierFromSlug(slug: string | null | undefined): MembershipTier | undefined {
  return slug ? TIER_BY_SLUG[slug.toLowerCase()] : undefined
}

export function tierPriceCents(slug: string): number {
  const tier = tierFromSlug(slug)
  return tier ? MEMBERSHIP_TIERS[tier].priceCents : 0
}

export function tierLabel(tier: MembershipTier | null | undefined): string {
  return tier ? MEMBERSHIP_TIERS[tier]?.label ?? "Member" : "Member"
}

export function formatTierPrice(priceCents: number): string {
  return `$${(priceCents / 100).toLocaleString("en-US", { maximumFractionDigits: 0 })}`
}

/**
 * Parses the level names staff use in spreadsheets and contracts ("Meeting",
 * "MIXER", "Sponsorship Member"). Unknown names return undefined rather than a
 * guess, so an importer can stop and ask.
 */
export function tierFromName(name: string | null | undefined): MembershipTier | undefined {
  const n = (name ?? "").toLowerCase().replace(/membership|member/g, "").trim()
  return MEMBERSHIP_TIER_VALUES.find(t => MEMBERSHIP_TIERS[t].name.toLowerCase() === n)
}

/**
 * Chapters from the WordPress era. Kept only so historical members and the seed
 * still have rows to point at; the 2026 levels are not sold by chapter.
 */
export const LAUNCH_CHAPTERS = [
  { code: "SS", name: "South Side East", displayOrder: 1 },
  { code: "CC", name: "Center of the City", displayOrder: 2 },
  { code: "SO", name: "Stone Oak", displayOrder: 3 },
] as const
