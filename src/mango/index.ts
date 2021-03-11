import { PrismaClient } from "@prisma/client";
export function createdbclient() {
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
      }
      // async setprefix(id: string, prefix: string): Promise<void> {}
   };
}
