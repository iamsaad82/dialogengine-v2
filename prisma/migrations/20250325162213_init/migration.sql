-- CreateTable
CREATE TABLE "AppSettings" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "lunaryEnabled" BOOLEAN NOT NULL DEFAULT false,
    "lunaryProjectId" TEXT,
    "brandName" TEXT NOT NULL DEFAULT 'Brandenburg Dialog',
    "logoUrl" TEXT,
    "defaultPrimaryColor" TEXT NOT NULL DEFAULT '#e63946',
    "defaultWelcomeMessage" TEXT NOT NULL DEFAULT 'Willkommen! Wie kann ich Ihnen mit Informationen zur Stadtverwaltung Brandenburg an der Havel helfen?',
    "enableDebugMode" BOOLEAN NOT NULL DEFAULT false,
    "cacheTimeout" INTEGER NOT NULL DEFAULT 3600,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bot" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "avatarUrl" TEXT,
    "welcomeMessage" TEXT NOT NULL DEFAULT 'Willkommen! Wie kann ich Ihnen helfen?',
    "flowiseId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BotSettings" (
    "id" TEXT NOT NULL,
    "primaryColor" TEXT NOT NULL DEFAULT '#3b82f6',
    "botBgColor" TEXT NOT NULL DEFAULT 'rgba(248, 250, 252, 0.8)',
    "botTextColor" TEXT NOT NULL DEFAULT '#000000',
    "botAccentColor" TEXT NOT NULL DEFAULT '#3b82f6',
    "userBgColor" TEXT NOT NULL DEFAULT '',
    "userTextColor" TEXT NOT NULL DEFAULT '#ffffff',
    "enableFeedback" BOOLEAN NOT NULL DEFAULT true,
    "enableAnalytics" BOOLEAN NOT NULL DEFAULT true,
    "showSuggestions" BOOLEAN NOT NULL DEFAULT true,
    "showCopyButton" BOOLEAN NOT NULL DEFAULT true,
    "botId" TEXT NOT NULL,

    CONSTRAINT "BotSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "botId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BotSettings_botId_key" ON "BotSettings"("botId");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_sessionId_key" ON "Conversation"("sessionId");

-- AddForeignKey
ALTER TABLE "BotSettings" ADD CONSTRAINT "BotSettings_botId_fkey" FOREIGN KEY ("botId") REFERENCES "Bot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_botId_fkey" FOREIGN KEY ("botId") REFERENCES "Bot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
