-- Per-event ticket tiers.
--
-- Event carried a single price/memberPrice pair, which cannot represent what MEC
-- actually sells: several named tickets per event at different prices. Tiers become
-- the thing you buy; Event.price/memberPrice stay as the "from" figure the listing
-- pages display, derived from the tiers.
--
-- Every existing event gets a General Admission tier from its current prices, and
-- every existing registration is rewritten as a line against that tier, so nothing
-- is left without a tier to point at.

CREATE TABLE "TicketTier" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "memberPrice" DECIMAL(10,2),
    "quantity" INTEGER,
    "salesStartAt" TIMESTAMP(3),
    "salesEndAt" TIMESTAMP(3),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "wpId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TicketTier_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "TicketTier_eventId_idx" ON "TicketTier"("eventId");
CREATE INDEX "TicketTier_wpId_idx" ON "TicketTier"("wpId");

ALTER TABLE "TicketTier" ADD CONSTRAINT "TicketTier_eventId_fkey"
  FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "EventRegistrationItem" (
    "id" TEXT NOT NULL,
    "registrationId" TEXT NOT NULL,
    "ticketTierId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventRegistrationItem_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "EventRegistrationItem_registrationId_idx" ON "EventRegistrationItem"("registrationId");
CREATE INDEX "EventRegistrationItem_ticketTierId_idx" ON "EventRegistrationItem"("ticketTierId");

ALTER TABLE "EventRegistrationItem" ADD CONSTRAINT "EventRegistrationItem_registrationId_fkey"
  FOREIGN KEY ("registrationId") REFERENCES "EventRegistration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EventRegistrationItem" ADD CONSTRAINT "EventRegistrationItem_ticketTierId_fkey"
  FOREIGN KEY ("ticketTierId") REFERENCES "TicketTier"("id") ON UPDATE CASCADE;

-- One General Admission tier per existing event. price is NOT NULL on the tier, so
-- events with no price recorded become free rather than failing the migration.
INSERT INTO "TicketTier" ("id", "eventId", "name", "price", "memberPrice", "quantity", "sortOrder", "createdAt", "updatedAt")
SELECT
    gen_random_uuid()::text,
    e."id",
    'General Admission',
    COALESCE(e."price", 0),
    e."memberPrice",
    e."capacity",
    0,
    NOW(),
    NOW()
FROM "Event" e;

-- Rewrite existing registrations as lines against that tier. unitPrice is derived
-- from what was actually charged, not from the tier, so historical totals stay true
-- even where the event price has since changed.
INSERT INTO "EventRegistrationItem" ("id", "registrationId", "ticketTierId", "quantity", "unitPrice", "createdAt")
SELECT
    gen_random_uuid()::text,
    r."id",
    t."id",
    GREATEST(r."ticketCount", 1),
    CASE
        WHEN r."ticketCount" > 0 THEN ROUND(r."totalAmount" / r."ticketCount", 2)
        ELSE r."totalAmount"
    END,
    r."createdAt"
FROM "EventRegistration" r
JOIN "TicketTier" t ON t."eventId" = r."eventId" AND t."name" = 'General Admission';
