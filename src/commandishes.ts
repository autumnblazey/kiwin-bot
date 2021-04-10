import { Message } from "discord.js";
import { Commandish } from "./framework";
import { DBClient } from "./mango";

export const booper: Commandish = {
   exec(msg) {
      if (!msg.content.startsWith("boop")) return;
      msg.mentions.users.forEach(u => msg.channel.send(`*boops* <@${u.id}>`));
      if (msg.mentions.users.size > 0 && msg.deletable) msg.delete();
   }
};

export const h: (htimeout: number, db: DBClient) => Commandish = (htimeout, db) => {
   if (isNaN(htimeout)) throw "h timeout cannot be nan!";
   return {
      async exec(msg) {
         if (!msg.guild || msg.content !== "h") return;

         // check timeout
         const lasth = await db.gethtimeout(msg.guild.id, msg.author.id);
         // set new timeout always, makes spamming h to find the timeout
         // useless and not doable
         db.sethtimeout(msg.guild.id, msg.author.id);

         if ((Number(lasth) + htimeout) >= Date.now()) return; // to early not enough timeout
         await msg.channel.send("h").catch(console.error);
      }
   }
}
