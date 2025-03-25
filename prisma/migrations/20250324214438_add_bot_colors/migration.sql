-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BotSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    CONSTRAINT "BotSettings_botId_fkey" FOREIGN KEY ("botId") REFERENCES "Bot" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_BotSettings" ("botId", "enableAnalytics", "enableFeedback", "id", "primaryColor", "showCopyButton", "showSuggestions") SELECT "botId", "enableAnalytics", "enableFeedback", "id", "primaryColor", "showCopyButton", "showSuggestions" FROM "BotSettings";
DROP TABLE "BotSettings";
ALTER TABLE "new_BotSettings" RENAME TO "BotSettings";
CREATE UNIQUE INDEX "BotSettings_botId_key" ON "BotSettings"("botId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
