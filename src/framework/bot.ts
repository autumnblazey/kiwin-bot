import { Client, Message } from "discord.js";
import { Command, createcmdhandler } from "./command";
import { Commandish, createcmdishhandler } from "./commandish";
import { ReactionRole, createreactionrolehandlers } from "./reactionrole";

type BotOpts = Readonly<{
   token: string;
   stopevents: ReadonlyArray<string>;
   commands?: ReadonlyArray<Command>;
   commandishes?: ReadonlyArray<Commandish>;
   reactionrole?: ReadonlyArray<ReactionRole>;
   prefix?(msg: Message): string | Promise<string>;
   repliers?: boolean;
}>;

export type Bot<R extends boolean = false> = Readonly<{
   readonly client: Client;
   stop(): void;
} & (R extends true ? {
   registerreplier: (msg: Message) => unknown;
   registeruserreplier: (msg: Message) => unknown;
} : {})>;

// registerreplier: R extends true ? (msg: Message) => unknown : undefined;
// registeruserreplier: R extends true ? (msg: Message) => unknown : undefined;

export async function createbot(opts: BotOpts): Promise<Bot<typeof opts.repliers extends boolean ? typeof opts.repliers : false>> {
   const djsbot = new Client();

   let up = true;
   const bot: Bot<false> = {
      get client() {
         return djsbot;
      },
      stop: () => up && (void djsbot.destroy() ?? (up = false))
   }

   // if (opts.commands) djsbot.on("message", );
   // if (opts.commandishes) djsbot.on("message", );

   const handlers: Array<(msg: Message) => unknown> = [];
   if (opts.commandishes) handlers.push(createcmdishhandler({
      bot,
      commandishes: opts.commandishes
   }));
   if (opts.commands) handlers.push(createcmdhandler({
      bot,
      commands: opts.commands,
      prefix: opts.prefix
   }));
   if (opts.repliers) {
      const repliers_channel: {
         [k: string]: Generator<void, void, Message>
      } = {};
      const repliers_user: {
         [k: string]: Generator<void, void, Message>
      } = {};

   } else djsbot.on("message", msg => handlers.forEach(h => h(msg)));

   if (opts.reactionrole) {
      const h = await createreactionrolehandlers({
         bot,
         roles: opts.reactionrole
      });
      djsbot.on("messageReactionAdd", h.add);
      djsbot.on("messageReactionRemove", h.remove);
   }

   await djsbot.login(opts.token);
   opts.stopevents.forEach(e => process.on(e, () => bot.stop()));

   return bot;
}
/*
   createcmdhandler({
      bot,
      commands: opts.commands,
      prefix: opts.prefix
   })
   createcmdishhandler({
      bot,
      commandishes: opts.commandishes
   })

Array<() => Generator<void, void, Message>>
*/
const h = ""
