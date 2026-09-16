-- Tickets and check-in (#159): a token per registration for its ticket page and QR
-- code, and the moment the door marked it arrived.
ALTER TABLE "EventRegistration" ADD COLUMN "ticketToken" TEXT;
ALTER TABLE "EventRegistration" ADD COLUMN "checkedInAt" TIMESTAMP(3);
ALTER TABLE "EventRegistration" ADD COLUMN "checkedInBy" TEXT;

-- Existing registrations get a token too, so their buyers can be sent a ticket.
UPDATE "EventRegistration"
SET "ticketToken" = md5(random()::text || clock_timestamp()::text || id) || md5(id || random()::text)
WHERE "ticketToken" IS NULL;

CREATE UNIQUE INDEX "EventRegistration_ticketToken_key" ON "EventRegistration"("ticketToken");
