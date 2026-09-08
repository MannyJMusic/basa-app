-- Venues and organizers as first-class entities.
--
-- Event.organizerId pointed at Member, which cannot represent the organizers that
-- actually run BASA events - BASA itself, partner organisations. It moves to a new
-- Organizer table, keeping an optional link back to Member for the common case where
-- the organizer is a member.
--
-- Venues were loose strings on Event (location/address/city/state/zipCode). MEC shares
-- them across events as mec_location posts, so they become reusable rows.

CREATE TABLE "Venue" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "capacity" INTEGER,
    "website" TEXT,
    "wpId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Venue_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Venue_wpId_key" ON "Venue"("wpId");
CREATE INDEX "Venue_name_idx" ON "Venue"("name");

CREATE TABLE "Organizer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "memberId" TEXT,
    "wpId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organizer_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Organizer_wpId_key" ON "Organizer"("wpId");
CREATE INDEX "Organizer_name_idx" ON "Organizer"("name");
CREATE INDEX "Organizer_memberId_idx" ON "Organizer"("memberId");

ALTER TABLE "Organizer" ADD CONSTRAINT "Organizer_memberId_fkey"
  FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- One Organizer per Member that currently organizes an event. Named from the business
-- where there is one, otherwise the person; both can be blank in existing data, so
-- 'Organizer' is the last resort rather than a NULL that violates NOT NULL.
INSERT INTO "Organizer" ("id", "name", "email", "phone", "website", "memberId", "createdAt", "updatedAt")
SELECT
    gen_random_uuid()::text,
    COALESCE(
        NULLIF(TRIM(m."businessName"), ''),
        NULLIF(TRIM(CONCAT_WS(' ', u."firstName", u."lastName")), ''),
        'Organizer'
    ),
    COALESCE(NULLIF(TRIM(m."businessEmail"), ''), u."email"),
    NULLIF(TRIM(m."businessPhone"), ''),
    NULLIF(TRIM(m."website"), ''),
    m."id",
    NOW(),
    NOW()
FROM "Member" m
JOIN "User" u ON u."id" = m."userId"
WHERE m."id" IN (SELECT DISTINCT "organizerId" FROM "Event" WHERE "organizerId" IS NOT NULL);

-- Repoint events at the new organizers before the column changes meaning.
ALTER TABLE "Event" DROP CONSTRAINT IF EXISTS "Event_organizerId_fkey";
ALTER TABLE "Event" ALTER COLUMN "organizerId" DROP NOT NULL;

UPDATE "Event" e
SET "organizerId" = o."id"
FROM "Organizer" o
WHERE o."memberId" = e."organizerId";

ALTER TABLE "Event" ADD CONSTRAINT "Event_organizerId_fkey"
  FOREIGN KEY ("organizerId") REFERENCES "Organizer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Venues, built from the distinct places existing events already reference.
ALTER TABLE "Event" ADD COLUMN "venueId" TEXT;

INSERT INTO "Venue" ("id", "name", "address", "city", "state", "zipCode", "createdAt", "updatedAt")
SELECT
    gen_random_uuid()::text,
    e."location",
    e."address",
    e."city",
    e."state",
    e."zipCode",
    NOW(),
    NOW()
FROM (
    SELECT DISTINCT "location", "address", "city", "state", "zipCode"
    FROM "Event"
    WHERE NULLIF(TRIM("location"), '') IS NOT NULL
) e;

UPDATE "Event" e
SET "venueId" = v."id"
FROM "Venue" v
WHERE e."location" = v."name"
  AND e."address" IS NOT DISTINCT FROM v."address"
  AND e."city" IS NOT DISTINCT FROM v."city"
  AND e."state" IS NOT DISTINCT FROM v."state"
  AND e."zipCode" IS NOT DISTINCT FROM v."zipCode";

CREATE INDEX "Event_venueId_idx" ON "Event"("venueId");

ALTER TABLE "Event" ADD CONSTRAINT "Event_venueId_fkey"
  FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE SET NULL ON UPDATE CASCADE;
