-- Update MembershipTier enum to include all the new values
ALTER TYPE "MembershipTier" ADD VALUE IF NOT EXISTS 'MEETING_MEMBER';
ALTER TYPE "MembershipTier" ADD VALUE IF NOT EXISTS 'ASSOCIATE_MEMBER';
ALTER TYPE "MembershipTier" ADD VALUE IF NOT EXISTS 'TRIO_MEMBER';
ALTER TYPE "MembershipTier" ADD VALUE IF NOT EXISTS 'CLASS_RESOURCE_MEMBER';
ALTER TYPE "MembershipTier" ADD VALUE IF NOT EXISTS 'NAG_RESOURCE_MEMBER';
ALTER TYPE "MembershipTier" ADD VALUE IF NOT EXISTS 'TRAINING_RESOURCE_MEMBER';

-- Update Status enum to include all the new values
ALTER TYPE "Status" ADD VALUE IF NOT EXISTS 'PENDING';
ALTER TYPE "Status" ADD VALUE IF NOT EXISTS 'EXPIRED';

-- Update TestimonialStatus enum to include the new values
ALTER TYPE "TestimonialStatus" ADD VALUE IF NOT EXISTS 'DRAFT';
ALTER TYPE "TestimonialStatus" ADD VALUE IF NOT EXISTS 'PUBLISHED';
ALTER TYPE "TestimonialStatus" ADD VALUE IF NOT EXISTS 'ARCHIVED';

-- Create AccountStatus enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE "AccountStatus" AS ENUM ('PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED', 'INACTIVE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create InvitationStatus enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'DECLINED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$; 