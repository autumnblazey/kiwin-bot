import { Command } from "./framework";

export const commands: ReadonlyArray<Command> = [
   {
      name: "boop",
      exec(msg) {
         msg.mentions.users.forEach(u => msg.channel.send(`*boops* <@${u.id}>`))
      }
   }
];
