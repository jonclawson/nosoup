-- CreateTable
CREATE TABLE "MenuTab" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    CONSTRAINT "MenuTab_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "MenuTab_articleId_key" ON "MenuTab"("articleId");
