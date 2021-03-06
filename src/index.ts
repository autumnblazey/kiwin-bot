import { config } from "dotenv";
import { backup as backupdb } from "./backups";
import { booper, h } from "./commandishes";
import { commands } from "./commands";
import { createbot } from "./framework";
import { createdbclient } from "./mango";

function getenv(env: string) {
   const envthing = process.env[env];
   if (envthing) return envthing;
   throw `process.env["${env}"] no exist`;
}

(async () => {
   config();

   // env vars
   const htimeout = Number(getenv("H_TIMEOUT"));
   const token = getenv("TOKEN");

   const stopevents = ["exit", "SIGINT", "SIGTERM"];
   const db = createdbclient();

   backupdb();
   //                                              s   min  hr   day
   const backupinterval = setInterval(backupdb, 1000 * 60 * 60 * 24);
   stopevents.forEach(e => process.on(e, () => clearInterval(backupinterval)));

   createbot({
      stopevents,
      token,
      prefix(msg) {
         return msg.guild?.id ? db.getprefix(msg.guild.id) : "";
      },
      commands: commands(db),
      commandishes: [
         booper, h(htimeout, db)
      ]
   });
})().catch(e => {
   console.error(e);
   process.exitCode = 64;
});
