import { Command } from "./framework";
import { createdbclient } from "./mango";

const helpcmd = `
Hai! No useful help available at the moment kek
`.trim();
export const commands: (db: ReturnType<typeof createdbclient>) => ReadonlyArray<Command> = db => [
   {
      name: "boop",
      exec(msg) {
         msg.mentions.users.forEach(u => msg.channel.send(`*boops* <@${u.id}>`).catch(console.error))
      }
   },
   {
      name: "setprefix",
      exec(msg, arg) {
         if (!msg.guild) return msg.channel.send("no").catch(console.error);
         db.setprefix(msg.guild.id, arg);
      }
   },
   {
      name: "help",
      exec(msg) {
         msg.channel.send(helpcmd).catch(console.error);
      }
   }
];
