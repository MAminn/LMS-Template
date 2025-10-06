-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_landing_page_features" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT 'blue',
    "features" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "contentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_landing_page_features" ("color", "contentId", "createdAt", "description", "features", "icon", "id", "isActive", "order", "title", "updatedAt") SELECT "color", "contentId", "createdAt", "description", "features", "icon", "id", "isActive", "order", "title", "updatedAt" FROM "landing_page_features";
DROP TABLE "landing_page_features";
ALTER TABLE "new_landing_page_features" RENAME TO "landing_page_features";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
