-- Represent an event that happens on more than one date (part of #55).
--
-- MEC keeps two versions of recurrence: repeat *rules* in post meta, and the
-- occurrences it has already materialized into `wp_mec_dates`. They disagree, and
-- checking the 2026-09-09 dump showed the rules cannot be trusted: of the 15
-- events flagged as recurring, 8 carry an identical `until` of 2020-09-30 while
-- starting between October 2020 and September 2021, so their rule ends before the
-- event begins. MEC agrees, giving each of those exactly one date.
--
-- What is real is 4 short weekly series of 4 dates each, all finished. That is why
-- this migration adds a way to *represent* a series and not a rule engine: there is
-- no rule in the source data worth importing, and the forward-looking feature -
-- entering a monthly chapter meeting once - needs a conversation about which
-- patterns BASA actually schedules rather than a guess. See #55.
--
-- Shape: the first occurrence IS the series. A four-week series is one parent row
-- plus three children, rather than a hidden template plus four children. That keeps
-- one imported WordPress post equal to one row with a wpId, keeps every occurrence a
-- normal Event that listings, registrations and ticket tiers already handle, and
-- avoids a template row that would have to be hidden from every public query. The
-- cost is the asymmetry: cancelling "the series" means cancelling the parent and its
-- children, not one row.
ALTER TABLE "Event" ADD COLUMN "parentEventId" TEXT;

-- The slot this occurrence was generated for, which is not the same as when it
-- happens: moving one occurrence must not lose which slot it belongs to, and must
-- not make a re-import recreate the original.
ALTER TABLE "Event" ADD COLUMN "occurrenceStart" TIMESTAMP(3);

-- Postgres allows any number of rows where either column is null, so the 250-odd
-- events that are not part of a series are unaffected. What it does prevent is a
-- second import creating a duplicate occupant of the same slot.
CREATE UNIQUE INDEX "Event_parentEventId_occurrenceStart_key"
  ON "Event"("parentEventId", "occurrenceStart");
CREATE INDEX "Event_parentEventId_idx" ON "Event"("parentEventId");

-- Deleting a series deletes its later occurrences. The alternative - orphaning them
-- as standalone events - would leave rows on the public calendar that no longer
-- belong to anything, which is worse than losing them.
ALTER TABLE "Event" ADD CONSTRAINT "Event_parentEventId_fkey"
  FOREIGN KEY ("parentEventId") REFERENCES "Event"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
