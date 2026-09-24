-- CreateEnum
CREATE TYPE "TierAudience" AS ENUM ('ALL', 'MEMBER', 'NON_MEMBER');

-- CreateEnum
CREATE TYPE "MemberRateRequestStatus" AS ENUM ('AWAITING_PAYMENT', 'PENDING', 'APPROVED', 'DENIED', 'EXPIRED', 'CANCELLED');

-- AlterTable
ALTER TABLE "EventRegistrationItem" ADD COLUMN     "memberUnitPrice" DECIMAL(10,2);

-- AlterTable
ALTER TABLE "TicketTier" ADD COLUMN     "audience" "TierAudience" NOT NULL DEFAULT 'ALL',
ADD COLUMN     "nonMemberTierId" TEXT;

-- CreateTable
CREATE TABLE "MemberRateRequest" (
    "id" TEXT NOT NULL,
    "registrationId" TEXT NOT NULL,
    "status" "MemberRateRequestStatus" NOT NULL DEFAULT 'AWAITING_PAYMENT',
    "heldCents" INTEGER NOT NULL,
    "memberCents" INTEGER NOT NULL,
    "authorizedAt" TIMESTAMP(3),
    "deadlineAt" TIMESTAMP(3),
    "decidedAt" TIMESTAMP(3),
    "decidedById" TEXT,
    "decisionNote" TEXT,
    "chargedCents" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MemberRateRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MemberRateRequest_registrationId_key" ON "MemberRateRequest"("registrationId");

-- CreateIndex
CREATE INDEX "MemberRateRequest_status_idx" ON "MemberRateRequest"("status");

-- AddForeignKey
ALTER TABLE "MemberRateRequest" ADD CONSTRAINT "MemberRateRequest_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "EventRegistration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberRateRequest" ADD CONSTRAINT "MemberRateRequest_decidedById_fkey" FOREIGN KEY ("decidedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketTier" ADD CONSTRAINT "TicketTier_nonMemberTierId_fkey" FOREIGN KEY ("nonMemberTierId") REFERENCES "TicketTier"("id") ON DELETE SET NULL ON UPDATE CASCADE;



-- Backfill: member and non-member prices were separate tiers told apart only by
-- name (imported from MEC). Classify them. "Future ..." is how BASA labels the
-- non-member rate; "Membership" (a membership sale) is not a member-only ticket.
UPDATE "TicketTier" SET "audience" = 'NON_MEMBER'
WHERE "name" ~* 'non[\s-]*member|\mfuture';

UPDATE "TicketTier" SET "audience" = 'MEMBER'
WHERE "audience" = 'ALL' AND "name" ~* '\mmembers?\M';

-- Pair the member tier with its non-member counterpart where an event has exactly
-- one of each; events with several pairs are paired by an admin in the tier editor.
UPDATE "TicketTier" m SET "nonMemberTierId" = n."id"
FROM "TicketTier" n
WHERE m."audience" = 'MEMBER' AND n."audience" = 'NON_MEMBER' AND n."eventId" = m."eventId"
  AND (SELECT count(*) FROM "TicketTier" x WHERE x."eventId" = m."eventId" AND x."audience" = 'MEMBER') = 1
  AND (SELECT count(*) FROM "TicketTier" y WHERE y."eventId" = m."eventId" AND y."audience" = 'NON_MEMBER') = 1;
