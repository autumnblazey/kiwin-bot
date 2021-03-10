import { createbot } from "./framework";
import { getenv } from "./rando";
import { config } from "dotenv";

(async () => {
   config();

   createbot({
      stopevents: ["exit", "SIGINT", "SIGTERM"],
      token: getenv("TOKEN"),
      commands: [{
         name: "boop",
         exec: (msg) => msg.mentions.users.forEach(u => msg.channel.send(`*boops* <@${u.id}>`))
      }]
   });
})().catch(e => {
   console.error(e);
   process.exitCode = 64;
});
