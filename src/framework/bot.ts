import { Client, Message } from "discord.js";
import { Command, createcmdhandler } from "./command";
import { Commandish, createcmdishhandler } from "./commandish";
import { ReactionRole, createreactionrolehandler } from "./reactionrole";

type BotOpts = Readonly<{
   token: string;
   stopevents: ReadonlyArray<string>;
   commands?: ReadonlyArray<Command>;
   commandishes?: ReadonlyArray<Commandish>;
   reactionrole?: ReadonlyArray<ReactionRole>;
   prefix?(msg: Message): string | Promise<string>;
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

   if (opts.commands) djsbot.on("message", createcmdhandler({
      bot,
      commands: opts.commands,
      prefix: opts.prefix
   }));
   if (opts.commandishes) djsbot.on("message", createcmdishhandler({
      bot,
      commandishes: opts.commandishes
   }));
   if (opts.reactionrole) djsbot.on("messageReactionAdd", await createreactionrolehandler({
      bot,
      roles: opts.reactionrole
   }));

   await djsbot.login(opts.token);
   opts.stopevents.forEach(e => process.on(e, () => bot.stop()));

   return bot;
}
