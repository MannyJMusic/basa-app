-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL,
    "organizationName" TEXT NOT NULL DEFAULT 'BASA - Business Association of San Antonio',
    "contactEmail" TEXT NOT NULL DEFAULT 'admin@basa.org',
    "phoneNumber" TEXT,
    "website" TEXT NOT NULL DEFAULT 'https://basa.org',
    "address" TEXT,
    "description" TEXT,
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "autoApproveMembers" BOOLEAN NOT NULL DEFAULT false,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "requireTwoFactor" BOOLEAN NOT NULL DEFAULT true,
    "sessionTimeout" INTEGER NOT NULL DEFAULT 30,
    "enforcePasswordPolicy" BOOLEAN NOT NULL DEFAULT true,
    "allowedIpAddresses" TEXT,
    "apiRateLimit" INTEGER NOT NULL DEFAULT 100,
    "notifyNewMembers" BOOLEAN NOT NULL DEFAULT true,
    "notifyPayments" BOOLEAN NOT NULL DEFAULT true,
    "notifyEventRegistrations" BOOLEAN NOT NULL DEFAULT true,
    "notifySystemAlerts" BOOLEAN NOT NULL DEFAULT true,
    "adminEmails" TEXT,
    "stripePublicKey" TEXT,
    "stripeSecretKey" TEXT,
    "stripeTestMode" BOOLEAN NOT NULL DEFAULT true,
    "smtpHost" TEXT,
    "smtpPort" INTEGER,
    "smtpUsername" TEXT,
    "smtpPassword" TEXT,
    "googleAnalyticsId" TEXT,
    "googleTagManagerId" TEXT,
    "logoUrl" TEXT,
    "faviconUrl" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#1e40af',
    "secondaryColor" TEXT NOT NULL DEFAULT '#059669',
    "showMemberCount" BOOLEAN NOT NULL DEFAULT true,
    "showEventCalendar" BOOLEAN NOT NULL DEFAULT true,
    "showTestimonials" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);
