-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MenuTab" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "articleId" TEXT NOT NULL,
    CONSTRAINT "MenuTab_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_MenuTab" ("articleId", "id", "link", "name") SELECT "articleId", "id", "link", "name" FROM "MenuTab";
DROP TABLE "MenuTab";
ALTER TABLE "new_MenuTab" RENAME TO "MenuTab";
CREATE UNIQUE INDEX "MenuTab_articleId_key" ON "MenuTab"("articleId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
