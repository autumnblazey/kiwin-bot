import { createbot } from "./framework";
import { getenv } from "./rando";
import { config } from "dotenv";
import { createdbclient } from "./mango";

(async () => {
   config();

   const db = createdbclient()

   createbot({
      stopevents: ["exit", "SIGINT", "SIGTERM"],
      token: getenv("TOKEN"),
      prefix(msg) {
         return msg.guild?.id ? db.getprefix(msg.guild.id) : "";
      },
      commands: [{
         name: "boop",
         exec: (msg) => msg.mentions.users.forEach(u => msg.channel.send(`*boops* <@${u.id}>`))
      }]
   });
})().catch(e => {
   console.error(e);
   process.exitCode = 64;
});
