-- Attendee details on a registration, and one registration per PaymentIntent.
--
-- The registration form has always collected a name and email per ticket and then
-- thrown them away: EventRegistration only stores the buyer. `attendees` keeps them
-- as [{ name, email? }] so an event organiser knows who is actually coming.
--
-- The unique index on paymentIntentId is what makes the Stripe webhook safe to
-- retry. Stripe redelivers events, and confirmation looks the registration up by
-- PaymentIntent; without uniqueness a redelivery could match several rows, and a
-- retried create could leave two registrations holding seats for one payment.

ALTER TABLE "EventRegistration" ADD COLUMN "attendees" JSONB;

-- Existing rows: null paymentIntentId does not violate a unique index in Postgres,
-- so pre-existing registrations without one are unaffected. Any genuine duplicate
-- would fail this index creation, which is the right outcome - it would mean two
-- registrations already share a payment and need looking at by hand.
CREATE UNIQUE INDEX "EventRegistration_paymentIntentId_key"
  ON "EventRegistration"("paymentIntentId");

-- Correct an omission in 20260908160000_ticket_tiers: that migration wrote the
-- ticketTierId foreign key with ON UPDATE CASCADE but no ON DELETE clause, so
-- Postgres defaulted to NO ACTION while schema.prisma implies RESTRICT for a
-- required relation. Both refuse to delete a tier that has registration items, but
-- the mismatch is real drift - `prisma migrate diff` reports it, and the next
-- person to run `migrate dev` would get a surprise migration correcting it.
ALTER TABLE "EventRegistrationItem"
  DROP CONSTRAINT "EventRegistrationItem_ticketTierId_fkey";
ALTER TABLE "EventRegistrationItem"
  ADD CONSTRAINT "EventRegistrationItem_ticketTierId_fkey"
  FOREIGN KEY ("ticketTierId") REFERENCES "TicketTier"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- Guest ticket checkout means a payment can complete with no user account behind
-- it. AuditLog.userId was NOT NULL with a foreign key to User, so a guest purchase
-- could not be recorded at all - and with members no longer signing in to buy
-- tickets, that is most purchases. Nullable keeps the audit trail meaningful.
ALTER TABLE "AuditLog" ALTER COLUMN "userId" DROP NOT NULL;

-- Making userId nullable also changes what the foreign key should do when a User is
-- deleted. Prisma's default for an optional relation is SET NULL; the existing
-- constraint was created for a required relation and would block the delete. Keeping
-- the audit row with a null user is the right behaviour - the record of what happened
-- should outlive the account that did it.
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_userId_fkey";
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
