-- Run only against basa-postgres-sandbox, with the app stopped. A production
-- snapshot is restored immediately before this script. If any statement fails,
-- the transaction rolls back and refresh-sandbox-data.sh leaves the app stopped.
BEGIN;

-- Keep only the directory and event graph. These tables contain credentials,
-- private communications, payment records, attendance, arbitrary JSON, or files.
TRUNCATE TABLE
  "Account", "Session", "VerificationToken", "AuditLog", "Payment",
  "StripeEvent", "MembershipInvitation", "Lead", "EventRegistration",
  "EventRegistrationItem", "MemberRateRequest", "MembershipReminder",
  "Referral", "Resource", "BlogPost", "Testimonial", "Sponsorship",
  "LegacyMembership";

WITH numbered AS (
  SELECT id, row_number() OVER (ORDER BY id) AS n FROM "User"
)
UPDATE "User" AS u SET
  "name" = 'Review Member ' || numbered.n,
  "email" = 'review-user-' || numbered.n || '@example.invalid',
  "emailVerified" = NULL,
  "image" = NULL,
  "firstName" = 'Review',
  "lastName" = 'Member ' || numbered.n,
  "hashedPassword" = NULL,
  "role" = CASE WHEN EXISTS (SELECT 1 FROM "Member" m WHERE m."userId" = u.id)
                THEN 'MEMBER' ELSE 'GUEST' END,
  "lastLogin" = NULL,
  "resetToken" = NULL,
  "resetTokenExpiry" = NULL,
  "verificationToken" = NULL,
  "verificationTokenExpiry" = NULL,
  "pendingEmail" = NULL,
  "emailChangeToken" = NULL,
  "emailChangeTokenExpiry" = NULL,
  "sessionsInvalidBefore" = NULL
FROM numbered WHERE u.id = numbered.id;

WITH numbered AS (
  SELECT id, row_number() OVER (ORDER BY id) AS n FROM "Member"
)
UPDATE "Member" AS m SET
  "businessName" = 'Review Business ' || numbered.n,
  "businessType" = 'Review',
  "industry" = '{}'::text[],
  "ein" = NULL,
  "numberOfEmployees" = NULL,
  "annualRevenue" = NULL,
  "businessEmail" = NULL,
  "businessPhone" = NULL,
  "businessAddress" = NULL,
  "city" = 'San Antonio',
  "state" = 'TX',
  "zipCode" = NULL,
  "website" = NULL,
  "stripeCustomerId" = NULL,
  "subscriptionId" = NULL,
  "logo" = NULL,
  "coverImage" = NULL,
  "description" = 'Sanitized review business profile.',
  "tagline" = NULL,
  "specialties" = '{}'::text[],
  "certifications" = '{}'::text[],
  "linkedin" = NULL,
  "facebook" = NULL,
  "instagram" = NULL,
  "twitter" = NULL,
  "youtube" = NULL,
  "wpUserId" = NULL,
  "allowContact" = false,
  "showAddress" = false,
  "newsletterSubscribed" = false
FROM numbered WHERE m.id = numbered.id;

WITH numbered AS (
  SELECT id, row_number() OVER (ORDER BY id) AS n FROM "Venue"
)
UPDATE "Venue" AS v SET
  "name" = 'Review Venue ' || numbered.n,
  "address" = NULL,
  "city" = 'San Antonio',
  "state" = 'TX',
  "zipCode" = NULL,
  "latitude" = NULL,
  "longitude" = NULL,
  "website" = NULL,
  "image" = NULL,
  "wpId" = NULL
FROM numbered WHERE v.id = numbered.id;

WITH numbered AS (
  SELECT id, row_number() OVER (ORDER BY id) AS n FROM "Organizer"
)
UPDATE "Organizer" AS o SET
  "name" = 'Review Organizer ' || numbered.n,
  "email" = NULL,
  "phone" = NULL,
  "website" = NULL,
  "wpId" = NULL
FROM numbered WHERE o.id = numbered.id;

WITH numbered AS (
  SELECT id, row_number() OVER (ORDER BY id) AS n FROM "Event"
)
UPDATE "Event" AS e SET
  "title" = 'Review Event ' || numbered.n,
  "slug" = 'review-event-' || numbered.n,
  "description" = 'Sanitized production event for review.',
  "shortDescription" = 'Sanitized production event for review.',
  "location" = 'San Antonio, TX',
  "address" = NULL,
  "city" = 'San Antonio',
  "state" = 'TX',
  "zipCode" = NULL,
  "category" = 'Review',
  "type" = CASE WHEN e."type" IN ('NETWORKING', 'SUMMIT', 'RIBBON_CUTTING', 'COMMUNITY')
                THEN e."type" ELSE 'NETWORKING' END,
  "image" = NULL,
  "tags" = '{}'::text[],
  "wpId" = NULL
FROM numbered WHERE e.id = numbered.id;

WITH numbered AS (
  SELECT id, row_number() OVER (ORDER BY id) AS n FROM "TicketTier"
)
UPDATE "TicketTier" AS t SET
  "name" = 'Review Ticket ' || numbered.n,
  "description" = NULL,
  "wpId" = NULL
FROM numbered WHERE t.id = numbered.id;

WITH numbered AS (
  SELECT id, row_number() OVER (ORDER BY id) AS n FROM "EventSpeaker"
)
UPDATE "EventSpeaker" AS s SET
  "name" = 'Review Speaker ' || numbered.n,
  "title" = NULL,
  "company" = NULL,
  "bio" = NULL,
  "image" = NULL,
  "topic" = NULL
FROM numbered WHERE s.id = numbered.id;

WITH numbered AS (
  SELECT id, row_number() OVER (ORDER BY id) AS n FROM "EventSponsor"
)
UPDATE "EventSponsor" AS s SET
  "name" = 'Review Sponsor ' || numbered.n,
  "logo" = NULL,
  "website" = NULL
FROM numbered WHERE s.id = numbered.id;

UPDATE settings SET
  "organizationName" = 'BASA Review Sandbox',
  "contactEmail" = 'reviewer@example.invalid',
  "phoneNumber" = NULL,
  "website" = 'https://dev.businessassociationsa.com',
  "address" = NULL,
  "description" = 'Sanitized BASA review environment.',
  "maintenanceMode" = false,
  "autoApproveMembers" = false,
  "emailNotifications" = false,
  "allowedIpAddresses" = NULL,
  "notifyNewMembers" = false,
  "notifyPayments" = false,
  "notifyEventRegistrations" = false,
  "notifySystemAlerts" = false,
  "adminEmails" = 'reviewer@dev.businessassociationsa.com',
  "stripePublicKey" = NULL,
  "stripeTestMode" = true,
  "smtpHost" = NULL,
  "smtpPort" = NULL,
  "smtpUsername" = NULL,
  "googleAnalyticsId" = NULL,
  "googleTagManagerId" = NULL,
  "logoUrl" = NULL,
  "faviconUrl" = NULL;

-- Account and member IDs can appear in profile URLs. Rekey them so the scrubbed
-- records cannot be matched to production profiles. Event slugs are changed
-- above; event IDs stay because recurring events reference parent events.
UPDATE "User" SET id = gen_random_uuid()::text;
UPDATE "Member" SET id = gen_random_uuid()::text;
UPDATE "Venue" SET id = gen_random_uuid()::text;
UPDATE "Organizer" SET id = gen_random_uuid()::text;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Member") OR NOT EXISTS (SELECT 1 FROM "Event") THEN
    RAISE EXCEPTION 'Expected copied member and event records';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM settings) THEN
    RAISE EXCEPTION 'Expected a copied settings row';
  END IF;
  IF EXISTS (SELECT 1 FROM "User" WHERE "hashedPassword" IS NOT NULL OR
    email NOT LIKE 'review-user-%@example.invalid' OR "resetToken" IS NOT NULL OR
    "verificationToken" IS NOT NULL OR "pendingEmail" IS NOT NULL) THEN
    RAISE EXCEPTION 'User credentials or addresses remain';
  END IF;
  IF EXISTS (SELECT 1 FROM "Member" WHERE "businessName" NOT LIKE 'Review Business %' OR
    "businessEmail" IS NOT NULL OR "businessPhone" IS NOT NULL OR
    "businessAddress" IS NOT NULL OR "ein" IS NOT NULL OR "logo" IS NOT NULL) THEN
    RAISE EXCEPTION 'Member identifiers remain';
  END IF;
  IF EXISTS (SELECT 1 FROM "Event" WHERE title NOT LIKE 'Review Event %' OR
    description <> 'Sanitized production event for review.' OR image IS NOT NULL) THEN
    RAISE EXCEPTION 'Event content remains';
  END IF;
  IF EXISTS (SELECT 1 FROM "Venue" WHERE name NOT LIKE 'Review Venue %' OR
    address IS NOT NULL OR website IS NOT NULL OR image IS NOT NULL) OR
    EXISTS (SELECT 1 FROM "Organizer" WHERE name NOT LIKE 'Review Organizer %' OR
    email IS NOT NULL OR phone IS NOT NULL) THEN
    RAISE EXCEPTION 'Venue or organizer identifiers remain';
  END IF;
  IF EXISTS (SELECT 1 FROM "User" WHERE id !~ '^[0-9a-f]{8}-') OR
    EXISTS (SELECT 1 FROM "Member" WHERE id !~ '^[0-9a-f]{8}-') THEN
    RAISE EXCEPTION 'Production account or member IDs remain';
  END IF;
  IF EXISTS (SELECT 1 FROM "Account") OR EXISTS (SELECT 1 FROM "Session") OR
    EXISTS (SELECT 1 FROM "AuditLog") OR EXISTS (SELECT 1 FROM "Payment") OR
    EXISTS (SELECT 1 FROM "EventRegistration") OR EXISTS (SELECT 1 FROM "Lead") THEN
    RAISE EXCEPTION 'Private records remain';
  END IF;
END $$;

COMMIT;
