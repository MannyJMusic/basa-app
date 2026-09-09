import type { MembershipTier } from "@prisma/client"

export type TierKind = "CHAPTER" | "RESOURCE"

export interface TierDefinition {
  tier: MembershipTier
  /** Identifier used in cart items, Stripe metadata, and admin payloads. */
  slug: string
  label: string
  priceCents: number
  kind: TierKind
  /** TRIO is sold as access to every chapter rather than to one. */
  impliesAllChapters: boolean
}

export const MEMBERSHIP_TIERS: Record<MembershipTier, TierDefinition> = {
  MEETING_MEMBER: {
    tier: "MEETING_MEMBER",
    slug: "meeting-member",
    label: "Meeting Member",
    priceCents: 14900,
    kind: "CHAPTER",
    impliesAllChapters: false,
  },
  ASSOCIATE_MEMBER: {
    tier: "ASSOCIATE_MEMBER",
    slug: "associate-member",
    label: "Associate Member",
    priceCents: 24500,
    kind: "CHAPTER",
    impliesAllChapters: false,
  },
  TRIO_MEMBER: {
    tier: "TRIO_MEMBER",
    slug: "trio-member",
    label: "TRIO Member",
    priceCents: 29500,
    kind: "CHAPTER",
    impliesAllChapters: true,
  },
  CLASS_RESOURCE_MEMBER: {
    tier: "CLASS_RESOURCE_MEMBER",
    slug: "class-resource-member",
    label: "Class Resource Member",
    priceCents: 12000,
    kind: "RESOURCE",
    impliesAllChapters: false,
  },
  NAG_RESOURCE_MEMBER: {
    tier: "NAG_RESOURCE_MEMBER",
    slug: "nag-resource-member",
    label: "NAG Resource Member",
    priceCents: 0,
    kind: "RESOURCE",
    impliesAllChapters: false,
  },
  TRAINING_RESOURCE_MEMBER: {
    tier: "TRAINING_RESOURCE_MEMBER",
    slug: "training-resource-member",
    label: "Training Resource Member",
    priceCents: 22500,
    kind: "RESOURCE",
    impliesAllChapters: false,
  },
}

export const MEMBERSHIP_TIER_VALUES = Object.keys(MEMBERSHIP_TIERS) as [
  MembershipTier,
  ...MembershipTier[],
]

export const CHAPTER_TIERS: TierDefinition[] = MEMBERSHIP_TIER_VALUES
  .map(t => MEMBERSHIP_TIERS[t])
  .filter(d => d.kind === "CHAPTER")

export const RESOURCE_TIERS: TierDefinition[] = MEMBERSHIP_TIER_VALUES
  .map(t => MEMBERSHIP_TIERS[t])
  .filter(d => d.kind === "RESOURCE")

const TIER_BY_SLUG: Record<string, MembershipTier> = Object.fromEntries(
  MEMBERSHIP_TIER_VALUES.map(t => [MEMBERSHIP_TIERS[t].slug, t])
)

export function tierFromSlug(slug: string): MembershipTier | undefined {
  return TIER_BY_SLUG[slug]
}

export function tierPriceCents(slug: string): number {
  const tier = tierFromSlug(slug)
  return tier ? MEMBERSHIP_TIERS[tier].priceCents : 0
}

export function tierLabel(tier: MembershipTier): string {
  return MEMBERSHIP_TIERS[tier].label
}

/** Single-chapter tiers need a chapter recorded; TRIO and the resource line do not. */
export function tierRequiresChapter(tier: MembershipTier): boolean {
  const def = MEMBERSHIP_TIERS[tier]
  return def.kind === "CHAPTER" && !def.impliesAllChapters
}

export function formatTierPrice(priceCents: number): string {
  return priceCents === 0
    ? "Included"
    : `$${(priceCents / 100).toLocaleString("en-US", { maximumFractionDigits: 0 })}`
}

/**
 * The chapters basa-app sells at launch. South Side West (`SS W` in PMPro) is
 * deliberately absent: 3 members ever, none active. #58 recreates it inactive
 * if historical members need attaching to it.
 */
export const LAUNCH_CHAPTERS = [
  { code: "SS", name: "South Side East", displayOrder: 1 },
  { code: "CC", name: "Center of the City", displayOrder: 2 },
  { code: "SO", name: "Stone Oak", displayOrder: 3 },
] as const
