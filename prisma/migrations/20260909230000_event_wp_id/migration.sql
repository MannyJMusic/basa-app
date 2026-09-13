-- Let the WordPress importers recognise what they have already imported (#57).
--
-- Venue, Organizer and TicketTier were given a `wpId` when they were added, but
-- Event was not, so the events importer had nothing to upsert on. Matching on slug
-- instead would be wrong twice over: WordPress slugs change when an editor renames
-- an event, and basa-app is free to have its own event at the same slug.
--
-- Nullable on purpose. Events created in basa-app have no WordPress ancestor, and
-- Postgres allows any number of nulls in a unique index, so they are unaffected.
ALTER TABLE "Event" ADD COLUMN "wpId" INTEGER;
CREATE UNIQUE INDEX "Event_wpId_key" ON "Event"("wpId");

-- MEC numbers an event's tickets from 1, so a ticket's id is only meaningful with
-- its event. This is what makes re-importing an event update its tiers rather than
-- appending a second copy of each.
CREATE UNIQUE INDEX "TicketTier_eventId_wpId_key" ON "TicketTier"("eventId", "wpId");

-- MEC stores a photo against 30 of the 112 venues. Without somewhere to put it the
-- importer was dropping it on the floor, which is the one thing a migration should
-- never do. Same shape as Event.image: a URL, until basa-app has a media store.
ALTER TABLE "Venue" ADD COLUMN "image" TEXT;
