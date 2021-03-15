import { createbot } from "./framework";
import { getenv } from "./rando";
import { config } from "dotenv";
import { createdbclient } from "./mango";
import { backup as backupdb } from "./backups";
import { commands } from "./commands";
import { commandishes } from "./commandishes";

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
      commands, commandishes
   });
})().catch(e => {
   console.error(e);
   process.exitCode = 64;
});
