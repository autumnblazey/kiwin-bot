/*
  Warnings:

  - Added the required column `htimeout` to the `GuildMember` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GuildMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "serverid" TEXT NOT NULL,
    "htimeout" DATETIME NOT NULL,
    FOREIGN KEY ("serverid") REFERENCES "Server" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_GuildMember" ("id", "serverid") SELECT "id", "serverid" FROM "GuildMember";
DROP TABLE "GuildMember";
ALTER TABLE "new_GuildMember" RENAME TO "GuildMember";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
