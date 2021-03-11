import { Bot } from ".";
import { Message } from "discord.js";

export type Command = {
   name: string;
   exec: (msg: Message, arg: string) => unknown;
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

// function findcmd(cmds: ReadonlyArray<Command>, )

export function createcmdhandler(opts: CmdHandlerOpts) {
   // recursive search until finds one
   // call a fn with the array
   // find the cmd

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

   function processsubcmd(cmds: ReadonlyArray<Command>, msgcontent: string, msg: Message): boolean {
      const arg = getnextarg(msgcontent);
      const nextcmdlower = arg[0].toLowerCase()
      const cmdtorun = cmds.find(c => c.name === nextcmdlower);

      if (cmdtorun) {
         if (!cmdtorun.subcommands) {
            cmdtorun.exec(msg, arg[1]);
            return true;
         }

         const continuerecurse = processsubcmd(cmdtorun.subcommands, arg[1], msg);
         if (!continuerecurse) {
            cmdtorun.exec(msg, arg[1]);
         }

         return true;
      }
      return false;
   }

   return async function(msg: Message) {
      const noprefix = chopprefix(await Promise.resolve(opts.prefix ? opts.prefix(msg) : "!"), msg.content);
      if (noprefix === false) return;
      processsubcmd(opts.commands, noprefix, msg);
   }
}
