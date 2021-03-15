-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "serverid" TEXT NOT NULL,
    FOREIGN KEY ("serverid") REFERENCES "Server" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
