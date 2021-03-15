import { Message } from "discord.js";
import { Bot } from "./bot";

export type Command = {
   name: string;
   exec(this: Bot, msg: Message, arg: string): unknown;
   subcommands?: Array<Command>
};

export type CmdHandlerOpts = {
   bot: Bot;
   commands: ReadonlyArray<Command>;
   prefix?(msg: Message): string | Promise<string>;
};

function chopprefix(prefix: string, messagecontent: string): string | false {
   return messagecontent.toLowerCase().startsWith(prefix.toLowerCase())
      ? messagecontent.substring(prefix.length)
      : false;
}

function getnextarg(messagecontent: string): [string, string] {
   const space = messagecontent.indexOf(" ");
   return space === -1 ? [messagecontent, ""] : [
      messagecontent.substring(0, space).trim(),
      messagecontent.substring(space + 1).trim()
   ];
}

type internalcmdstorage = {
   [key: string]: undefined | {
      name: typeof key,
      exec: (msg: Message, arg: string) => unknown;
      subcmds?: internalcmdstorage
   }
}

function makeinternal(cmds: ReadonlyArray<Command>): internalcmdstorage {
   const storobj: internalcmdstorage = {};
   cmds.forEach(cmd => {
      storobj[cmd.name] = {
         name: cmd.name,
         exec: cmd.exec,
         subcmds: cmd.subcommands && makeinternal(cmd.subcommands)
      }
   });
   return storobj;
}

export function createcmdhandler(opts: CmdHandlerOpts) {
   // if found, {
   //    continue recursively
   //    if recursive function returned false indicating failure {
   //       execute this function
   //       return true, cause success
   //    }
   // }
   // if not found {
   //    return false
   // }

   const cmdsinternal: internalcmdstorage = makeinternal(opts.commands);

   function processsubcmd(cmds: internalcmdstorage, msgcontent: string, msg: Message): boolean {
      const arg = getnextarg(msgcontent);
      const nextcmdlower = arg[0].toLowerCase();
      const cmdtorun = cmds[nextcmdlower];

      if (cmdtorun) {
         if (!cmdtorun.subcmds) {
            cmdtorun.exec.bind(opts.bot)(msg, arg[1]);
            return true;
         }

         const continu = processsubcmd(cmdtorun.subcmds, arg[1], msg);
         if (!continu) {
            cmdtorun.exec.bind(opts.bot)(msg, arg[1]);
         }

         return true;
      }

      return false;
   }

   return async function(msg: Message) {
      const noprefix = chopprefix(await Promise.resolve(opts.prefix ? opts.prefix(msg) : "!"), msg.content);
      if (noprefix === false) return;
      processsubcmd(cmdsinternal, noprefix, msg);
   }
}
