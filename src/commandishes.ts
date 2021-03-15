import { Message } from "discord.js";
import { Commandish } from "./framework";

function* h(): Generator<void, void, Message> {
   let msg = yield;
   while (msg.content === "h") {
      msg = yield void msg.channel.send("h");
   }
}

export const commandishes: ReadonlyArray<Commandish> = [
   {
      exec(msg) {
         if (!msg.content.startsWith("boop")) return;
         msg.mentions.users.forEach(u => msg.channel.send(`*boops* <@${u.id}>`));
         if (msg.mentions.users.size > 0 && msg.deletable) msg.delete();
      }
   },
   {
      exec(msg) {
         msg.content === "h" && this.registerreplier(msg, h());
      }
   }
];
