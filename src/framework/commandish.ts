import { Message } from "discord.js";
import { Bot } from "./bot";

export type Commandish = {
   // test: (msg: Message) => boolean | Promise<boolean>;
   exec: (msg: Message) => unknown;
};

export type CommandishHandlerOpts = {
   bot: Bot;
   commandishes: ReadonlyArray<Commandish>;
};

export function createcmdishhandler(opts: CommandishHandlerOpts) {
   return async function(msg: Message) {
      opts.commandishes.forEach(c => c.exec(msg));
   }
}
