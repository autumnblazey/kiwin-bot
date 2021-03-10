import { Client } from "discord.js";
import { Command, createcmdhandler } from "./command";

type BotOpts = Readonly<{
   token: string;
   stopevents: ReadonlyArray<string>;
   commands?: ReadonlyArray<Command>;
}>;

export type Bot = Readonly<{
   readonly client: Client;
   stop(): void;
}>;

export async function createbot(opts: BotOpts): Promise<Bot> {
   const djsbot = new Client();

   let up = true;
   const bot: Bot = {
      get client() {
         return djsbot;
      },
      stop: () => up && (void djsbot.destroy() ?? (up = false))
   }
   if (opts.commands) djsbot.on("message", createcmdhandler({ bot, commands: opts.commands }))

   await djsbot.login(opts.token);
   opts.stopevents.forEach(e => process.on(e, () => bot.stop()));

   return bot;
}
