/*
  Warnings:

  - You are about to drop the `landing_page_content` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `landing_page_features` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "landing_page_content";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "landing_page_features";
PRAGMA foreign_keys=on;
