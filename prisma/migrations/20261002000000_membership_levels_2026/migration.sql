-- 2026 membership levels (Meeting, Market, Action, Mixer, Sponsorship) replace the
-- WordPress-era chapter and resource tiers. Only MEETING_MEMBER carries over; any
-- other old value becomes NULL and is set again by the member list import.
ALTER TYPE "MembershipTier" RENAME TO "MembershipTier_old";
CREATE TYPE "MembershipTier" AS ENUM ('MEETING_MEMBER', 'MARKET_MEMBER', 'ACTION_MEMBER', 'MIXER_MEMBER', 'SPONSORSHIP_MEMBER');
ALTER TABLE "Member" ALTER COLUMN "membershipTier" TYPE "MembershipTier"
  USING (CASE WHEN "membershipTier"::text = 'MEETING_MEMBER' THEN 'MEETING_MEMBER' ELSE NULL END)::"MembershipTier";
DROP TYPE "MembershipTier_old";

ALTER TABLE "Member" ADD COLUMN "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false;
