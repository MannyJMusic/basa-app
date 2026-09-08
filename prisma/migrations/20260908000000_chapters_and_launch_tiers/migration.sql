-- Chapters, and the removal of the three legacy tier values.
--
-- BASIC/PREMIUM/VIP predate the real product. They map onto the launch tiers using
-- the same mapping prisma/seed.ts has always applied. Postgres cannot drop a value
-- from an enum in place, so the type is recreated.

UPDATE "Member" SET "membershipTier" = 'MEETING_MEMBER'   WHERE "membershipTier" = 'BASIC';
UPDATE "Member" SET "membershipTier" = 'ASSOCIATE_MEMBER' WHERE "membershipTier" = 'PREMIUM';
UPDATE "Member" SET "membershipTier" = 'TRIO_MEMBER'      WHERE "membershipTier" = 'VIP';

ALTER TYPE "MembershipTier" RENAME TO "MembershipTier_old";

CREATE TYPE "MembershipTier" AS ENUM (
  'MEETING_MEMBER',
  'ASSOCIATE_MEMBER',
  'TRIO_MEMBER',
  'CLASS_RESOURCE_MEMBER',
  'NAG_RESOURCE_MEMBER',
  'TRAINING_RESOURCE_MEMBER'
);

ALTER TABLE "Member"
  ALTER COLUMN "membershipTier" TYPE "MembershipTier"
  USING ("membershipTier"::text::"MembershipTier");

DROP TYPE "MembershipTier_old";

CREATE TABLE "Chapter" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chapter_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Chapter_code_key" ON "Chapter"("code");

ALTER TABLE "Member" ADD COLUMN "chapterId" TEXT;

CREATE INDEX "Member_chapterId_idx" ON "Member"("chapterId");

ALTER TABLE "Member" ADD CONSTRAINT "Member_chapterId_fkey"
  FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
