import { Client } from "discord.js";

type BotOpts = Readonly<{
   token: string;
   stopevents: ReadonlyArray<string>;
}>;

type Bot = Readonly<{
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

   await djsbot.login(opts.token);
   opts.stopevents.forEach(e => process.on(e, () => bot.stop()))

   return bot;
}
