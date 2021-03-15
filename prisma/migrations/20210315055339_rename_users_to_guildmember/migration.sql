/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "User";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "GuildMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "serverid" TEXT NOT NULL,
    FOREIGN KEY ("serverid") REFERENCES "Server" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
