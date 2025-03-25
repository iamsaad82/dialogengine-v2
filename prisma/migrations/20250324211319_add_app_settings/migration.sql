-- CreateTable
CREATE TABLE "AppSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'global',
    "lunaryEnabled" BOOLEAN NOT NULL DEFAULT false,
    "lunaryProjectId" TEXT,
    "brandName" TEXT NOT NULL DEFAULT 'Brandenburg Dialog',
    "logoUrl" TEXT,
    "defaultPrimaryColor" TEXT NOT NULL DEFAULT '#e63946',
    "defaultWelcomeMessage" TEXT NOT NULL DEFAULT 'Willkommen! Wie kann ich Ihnen mit Informationen zur Stadtverwaltung Brandenburg an der Havel helfen?',
    "enableDebugMode" BOOLEAN NOT NULL DEFAULT false,
    "cacheTimeout" INTEGER NOT NULL DEFAULT 3600,
    "updatedAt" DATETIME NOT NULL
);
