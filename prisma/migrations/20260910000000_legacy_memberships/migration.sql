-- Somewhere to put a member's WordPress membership history (#58).
--
-- The 140 people with membership history on the WordPress site held Paid Memberships
-- Pro levels across five tiers - Meeting, Associate, Market, Mission, Action - and
-- four chapters. Three of those tiers do not exist in the launch product, so a legacy
-- level cannot be written into Member.membershipTier without inventing a mapping that
-- nobody asked for. Per the decisions on #51, everyone imports as EXPIRED and the few
-- still-current members are placed onto new tiers by hand; this table is what that
-- decision gets made from, and what stops "held SS Action, expired 2023" being lost.
--
-- 86 of the 140 held levels in more than one chapter, so this is deliberately a
-- one-to-many. Member.chapterId keeps a single primary chapter, which is all the
-- first pass of the new model supports.
CREATE TABLE "LegacyMembership" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    -- wp_pmpro_memberships_users.id: a member can hold the same level twice over the
    -- years, so the PMPro row id is the only thing that identifies one membership.
    "wpId" INTEGER NOT NULL,
    "wpLevelId" INTEGER NOT NULL,
    "levelName" TEXT NOT NULL,
    "chapterCode" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "status" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LegacyMembership_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LegacyMembership_wpId_key" ON "LegacyMembership"("wpId");
CREATE INDEX "LegacyMembership_memberId_idx" ON "LegacyMembership"("memberId");
CREATE INDEX "LegacyMembership_chapterCode_idx" ON "LegacyMembership"("chapterCode");

ALTER TABLE "LegacyMembership" ADD CONSTRAINT "LegacyMembership_memberId_fkey"
  FOREIGN KEY ("memberId") REFERENCES "Member"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- Same reasoning as Event.wpId: the importer needs something stable to upsert on, and
-- email is not it. People change email addresses, and matching on one would silently
-- merge an imported member into an unrelated basa-app account that happened to share it.
ALTER TABLE "Member" ADD COLUMN "wpUserId" INTEGER;
CREATE UNIQUE INDEX "Member_wpUserId_key" ON "Member"("wpUserId");
