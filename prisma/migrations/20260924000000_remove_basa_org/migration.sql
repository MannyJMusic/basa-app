-- basa.org is not BASA's domain. Replace it (and the seed's placeholder phone and
-- address) with BASA's real details, in the defaults and in any existing row.
-- Only exact placeholder values are rewritten; anything an admin typed is left.

-- AlterTable
ALTER TABLE "settings" ALTER COLUMN "contactEmail" SET DEFAULT 'info@businessassociationsa.com',
ALTER COLUMN "website" SET DEFAULT 'https://businessassociationsa.com';

UPDATE "settings" SET "contactEmail" = 'info@businessassociationsa.com' WHERE "contactEmail" = 'admin@basa.org';
UPDATE "settings" SET "website" = 'https://businessassociationsa.com' WHERE "website" = 'https://basa.org';
UPDATE "settings" SET "adminEmails" = 'info@businessassociationsa.com' WHERE "adminEmails" = E'admin@basa.org\nmanager@basa.org';
UPDATE "settings" SET "phoneNumber" = '(210) 549-7190' WHERE "phoneNumber" = '(210) 555-0123';
UPDATE "settings" SET "address" = '9002 Wurbach Rd, San Antonio, TX 78240' WHERE "address" = '123 Business District, San Antonio, TX 78205';

-- The audit-log system principal moves to an address that can never exist.
-- Renaming keeps existing audit rows attached to the same user.
UPDATE "User" SET "email" = 'system@businessassociationsa.invalid'
WHERE "email" = 'system@basa.org'
  AND NOT EXISTS (SELECT 1 FROM "User" WHERE "email" = 'system@businessassociationsa.invalid');
