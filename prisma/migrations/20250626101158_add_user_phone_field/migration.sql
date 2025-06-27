/*
  Warnings:

  - The values [PENDING,APPROVED,REJECTED] on the enum `TestimonialStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `authorCompany` on the `Testimonial` table. All the data in the column will be lost.
  - You are about to drop the column `authorImage` on the `Testimonial` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TestimonialStatus_new" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
ALTER TABLE "Testimonial" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Testimonial" ALTER COLUMN "status" TYPE "TestimonialStatus_new" USING ("status"::text::"TestimonialStatus_new");
ALTER TYPE "TestimonialStatus" RENAME TO "TestimonialStatus_old";
ALTER TYPE "TestimonialStatus_new" RENAME TO "TestimonialStatus";
DROP TYPE "TestimonialStatus_old";
ALTER TABLE "Testimonial" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- DropIndex
DROP INDEX "Testimonial_isFeatured_idx";

-- AlterTable
ALTER TABLE "Testimonial" DROP COLUMN "authorCompany",
DROP COLUMN "authorImage",
ADD COLUMN     "company" TEXT,
ALTER COLUMN "rating" DROP NOT NULL,
ALTER COLUMN "rating" DROP DEFAULT,
ALTER COLUMN "status" SET DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "newsletterSubscribed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "resetToken" TEXT,
ADD COLUMN     "resetTokenExpiry" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "company" TEXT,
    "message" TEXT,
    "source" TEXT NOT NULL DEFAULT 'website',
    "memberId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Lead_memberId_idx" ON "Lead"("memberId");

-- CreateIndex
CREATE INDEX "Lead_source_idx" ON "Lead"("source");

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;
