-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Server" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "prefix" TEXT NOT NULL DEFAULT '!',
    "h" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_Server" ("id", "prefix") SELECT "id", "prefix" FROM "Server";
DROP TABLE "Server";
ALTER TABLE "new_Server" RENAME TO "Server";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
