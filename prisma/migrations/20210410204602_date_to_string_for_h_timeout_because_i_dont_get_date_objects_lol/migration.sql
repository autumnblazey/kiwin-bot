-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GuildMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "serverid" TEXT NOT NULL,
    "htimeout" TEXT NOT NULL,
    FOREIGN KEY ("serverid") REFERENCES "Server" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_GuildMember" ("id", "serverid", "htimeout") SELECT "id", "serverid", "htimeout" FROM "GuildMember";
DROP TABLE "GuildMember";
ALTER TABLE "new_GuildMember" RENAME TO "GuildMember";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
