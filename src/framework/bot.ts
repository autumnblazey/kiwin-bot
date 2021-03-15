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
}>;

type tempbot = {
   readonly client: Client;
   stop(): void;
   /** replier that is triggered for anyone in that channel */
   registerreplier(msg: Message, gen: Generator<void, void, Message>): unknown;
   /** replier that is triggered for a specific user in a specific channel */
   registeruserreplier(msg: Message, gen: Generator<void, void, Message>): unknown;
};
export type Bot = Readonly<tempbot>;

function makereplierstore() {
   const repliers: {
      [key: string]: Generator<void, void, Message> | undefined;
   } = {};

   function key(msg: Message) {
      return `${msg.channel.id}`;
   }
   function userkey(msg: Message) {
      return `${msg.channel.id} ${msg.author.id}`;
   }

   function getrepliers(msg: Message): false | Generator<void, void, Message> {
      return repliers[key(msg)] ?? false
   }
   function getuserrepliers(msg: Message): false | Generator<void, void, Message> {
      return repliers[userkey(msg)] ?? false;
   }

   function putreplier(msg: Message, replier: Generator<void, void, Message>) {
      const k = key(msg);
      if (repliers[k] === undefined) {
         repliers[k] = replier;
         return true;
      } else return false;
   }
   function putuserreplier(msg: Message, replier: Generator<void, void, Message>) {
      const k = userkey(msg);
      if (repliers[k] === undefined) {
         repliers[k] = replier;
         return true;
      } else return false;
   }

   function deletereplier(msg: Message) {
      delete repliers[key(msg)];
   }
   function deleteuserreplier(msg: Message) {
      delete repliers[userkey(msg)];
   }
   return {
      key,            userkey,
      getrepliers,    getuserrepliers,
      putreplier,     putuserreplier,
      deletereplier,  deleteuserreplier
   };
}

export async function createbot(opts: BotOpts): Promise<Bot> {
   const djsbot = new Client();

   let up = true;
   const bot: tempbot = {
      get client() {
         return djsbot;
      },
      stop: () => up && (void djsbot.destroy() ?? (up = false)),
      registerreplier() {},
      registeruserreplier() {}
   }

   if (opts.reactionrole) {
      const h = await createreactionrolehandlers({
         bot,
         roles: opts.reactionrole
      });
      djsbot.on("messageReactionAdd", h.add);
      djsbot.on("messageReactionRemove", h.remove);
   }

   if (opts.commands || opts.commandishes) {
      const store = makereplierstore();

      const handlers: Array<(msg: Message) => unknown> = [];
      if (opts.commands) handlers.push(createcmdhandler({
         bot,
         commands: opts.commands,
         prefix: opts.prefix
      }));
      if (opts.commandishes) handlers.push(createcmdishhandler({
         bot,
         commandishes: opts.commandishes
      }));


      djsbot.on("message", msg => {
         if (djsbot.user === null ? msg.author.bot : djsbot.user === msg.author) return;

         let replier = store.getrepliers(msg);
         let source: "user" | "channel" = "channel";

         if (!replier) replier = store.getuserrepliers(msg), source = "user";
         if (!replier) return handlers.forEach(h => h(msg));

         const res = replier.next(msg);
         res.done && (
            source === "user" ? store.deleteuserreplier(msg)
            : source === "channel" ? store.deletereplier(msg)
            : "bruh"
         );
      });

      bot.registerreplier = function(msg, gen) {
         store.putreplier(msg, gen);
         gen.next(msg);
      }

      bot.registeruserreplier = function(msg, gen) {
         store.putuserreplier(msg, gen);
         gen.next(msg);
      }
   }

   await djsbot.login(opts.token);
   opts.stopevents.forEach(e => process.on(e, () => bot.stop()));

   return bot;
}
