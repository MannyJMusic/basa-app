-- Stage 3 authorization fixes (2026-09-22 audit).

-- H-A3: session JWTs issued before this moment are refused.
ALTER TABLE "User" ADD COLUMN "sessionsInvalidBefore" TIMESTAMP(3);

-- M-A1: Stripe event ids already handled, so webhook redeliveries are no-ops.
CREATE TABLE "StripeEvent" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StripeEvent_pkey" PRIMARY KEY ("id")
);

-- M-A3: secrets are not settings. Stripe and mail credentials live only in the
-- server environment; these columns were never read by anything.
ALTER TABLE "settings" DROP COLUMN "stripeSecretKey";
ALTER TABLE "settings" DROP COLUMN "smtpPassword";
