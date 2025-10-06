-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_branding_settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "logoUrl" TEXT,
    "logoText" TEXT DEFAULT 'The Academy',
    "logoType" TEXT NOT NULL DEFAULT 'text',
    "primaryColor" TEXT NOT NULL DEFAULT '#3b82f6',
    "secondaryColor" TEXT NOT NULL DEFAULT '#1e40af',
    "siteName" TEXT DEFAULT 'The Academy',
    "siteDescription" TEXT DEFAULT 'Learn anything, anywhere, anytime',
    "fontFamily" TEXT NOT NULL DEFAULT 'Inter',
    "faviconUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "branding_settings_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_branding_settings" ("createdAt", "createdBy", "faviconUrl", "fontFamily", "id", "isActive", "logoUrl", "primaryColor", "secondaryColor", "siteDescription", "siteName", "updatedAt") SELECT "createdAt", "createdBy", "faviconUrl", "fontFamily", "id", "isActive", "logoUrl", "primaryColor", "secondaryColor", "siteDescription", "siteName", "updatedAt" FROM "branding_settings";
DROP TABLE "branding_settings";
ALTER TABLE "new_branding_settings" RENAME TO "branding_settings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
