import { PrismaClient } from "@prisma/client";

export type DBClient = {
   getprefix(id: string): Promise<string>;
   setprefix(id: string, prefix: string): Promise<void>;
   gethhighscore(id: string): Promise<number>;
   sethhighscore(id: string, score: number): Promise<void>;
   gethtimeout(serverid: string, memberid: string): Promise<string>;
   sethtimeout(serverid: string, memberid: string): Promise<void>;
};

function guildmemberid(serverid: string, memberid: string) {
   return `${serverid} ${memberid}`;
}

export function createdbclient(): DBClient {
   const prisma = new PrismaClient();
   return {
      async getprefix(id: string): Promise<string> {
         const found = await prisma.server.findUnique({
            where: { id },
            rejectOnNotFound: false,
            select: { prefix: true }
         });

         if (found) return found.prefix;

         const created = await prisma.server.create({
            data: { id }
         });

         return created.prefix;
      },
      async setprefix(id: string, prefix: string): Promise<void> {
         await prisma.server.update({
            where: { id },
            data: { prefix }
         });
      },
      async gethhighscore(id: string): Promise<number> {
         const hhs = await prisma.server.findUnique({
            where: { id },
            rejectOnNotFound: false,
            select: { h: true }
         });

         if (hhs) return hhs.h;

         const created = await prisma.server.create({
            data: { id }
         });

         return created.h;
      },
      async sethhighscore(id: string, score: number): Promise<void> {
         await prisma.server.update({
            where: { id },
            data: { h: score }
         });
      },
      async gethtimeout(serverid, memberid) {
         const found = await prisma.guildMember.findUnique({
            where: {
               id: guildmemberid(serverid, memberid)
            },
            rejectOnNotFound: false,
            select: {
               htimeout: true
            }
         });
         if (found) return found.htimeout;

         const created = await prisma.guildMember.create({
            data: {
               id: guildmemberid(serverid, memberid),
               htimeout: "0",
               serverid
            }
         });

         return created.htimeout
      },
      async sethtimeout(serverid, memberid) {
         await prisma.guildMember.update({
            where: {
               id: guildmemberid(serverid, memberid)
            },
            data: {
               htimeout: Date.now().toString()
            }
         });
      }
   };
}
