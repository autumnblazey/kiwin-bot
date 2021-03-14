import { createbot } from "./framework";
import { config } from "dotenv";
import { createdbclient } from "./mango";

function getenv(env: string) {
   const envthing = process.env[env];
   if (envthing) return envthing;
   throw `process.env["${env}"] no exist`;
}

(async () => {
   config();

   const db = createdbclient()

   await createbot({
      stopevents: ["exit", "SIGINT", "SIGTERM"],
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
      }],
      reactionrole: [{
         channelid: "578740813912211457",
         emoji: "798032814275952660",
         messageid: "818024504881840218",
         roleid: "820435142325174302"
      }]
   });
})().catch(e => {
   console.error(e);
   process.exitCode = 64;
});
