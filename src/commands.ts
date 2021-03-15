import { Command } from "./framework";
import { createdbclient } from "./mango";

export const commands: (db: ReturnType<typeof createdbclient>) => ReadonlyArray<Command> = db => [
   {
      name: "boop",
      exec(msg) {
         msg.mentions.users.forEach(u => msg.channel.send(`*boops* <@${u.id}>`))
      }
   },
   {
      name: "setprefix",
      exec(msg, arg) {
         if (!msg.guild) return msg.channel.send("no");
         db.setprefix(msg.guild.id, arg);
      }
   }
];
