-- Record of renewal notices, so the daily sweep cannot send one twice (#82).
--
-- The expiry half of #52 shipped without notifications: members are moved to
-- EXPIRED the moment their term ends, with no warning beforehand. This is the
-- table that makes warning them safe to run every day.
--
-- The unique constraint is the whole mechanism. A missed run, a double run, or two
-- workers racing all end at the same place: one row per member per cycle per
-- interval. When a payment advances renewalDate, the cycle changes and a fresh set
-- of notices becomes possible - which is what should happen a year later.
CREATE TABLE "MembershipReminder" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    -- Deliberately the renewalDate at the time of sending, not a foreign key to
    -- anything: it is what identifies the cycle, and it must not move if the
    -- member later renews.
    "renewalDate" TIMESTAMP(3) NOT NULL,
    -- 0 means the notice sent after the membership actually lapsed.
    "daysBefore" INTEGER NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MembershipReminder_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MembershipReminder_memberId_renewalDate_daysBefore_key"
  ON "MembershipReminder"("memberId", "renewalDate", "daysBefore");
CREATE INDEX "MembershipReminder_memberId_idx" ON "MembershipReminder"("memberId");

ALTER TABLE "MembershipReminder" ADD CONSTRAINT "MembershipReminder_memberId_fkey"
  FOREIGN KEY ("memberId") REFERENCES "Member"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
