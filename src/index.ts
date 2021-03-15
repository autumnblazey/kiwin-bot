import { createbot } from "./framework";
import { getenv } from "./rando";
import { config } from "dotenv";
import { createdbclient } from "./mango";
import { backup as backupdb } from "./backups";

(async () => {
   config();
   const stopevents = ["exit", "SIGINT", "SIGTERM"];
   const db = createdbclient();

   backupdb();
   //                                              s   min  hr   day
   const backupinterval = setInterval(backupdb, 1000 * 60 * 60 * 24);
   stopevents.forEach(e => process.on(e, () => clearInterval(backupinterval)));

   createbot({
      stopevents,
      token: getenv("TOKEN"),
      prefix(msg) {
         return msg.guild?.id ? db.getprefix(msg.guild.id) : "";
      },
      commands: [{
         name: "boop",
         exec: (msg) => msg.mentions.users.forEach(u => msg.channel.send(`*boops* <@${u.id}>`))
      }],
      commandishes: [{
         exec: msg => {
            if (!msg.content.startsWith("boop")) return;
            msg.mentions.users.forEach(u => msg.channel.send(`*boops* <@${u.id}>`));
            if (msg.mentions.users.size > 0 && msg.deletable) msg.delete();
         }
      }]
   });
})().catch(e => {
   console.error(e);
   process.exitCode = 64;
});
