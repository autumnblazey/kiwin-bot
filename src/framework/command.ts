import { Message, MessageEmbed } from "discord.js";
import { Bot } from "./bot";

export type Command = {
   name: string;
   description?: string;
   exec(this: Bot, msg: Message, arg: string): unknown;
   subcommands?: Array<Command>
};

export type CmdHandlerOpts = {
   bot: Bot;
   commands: ReadonlyArray<Command>;
   prefix(msg: Message): string | Promise<string>;
};

function chopprefix(prefix: string, messagecontent: string): string | false {
   return messagecontent.toLowerCase().startsWith(prefix.toLowerCase())
      ? messagecontent.substring(prefix.length).trimStart()
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
      const noprefix = chopprefix(await Promise.resolve(opts.prefix(msg)), msg.content);
      if (noprefix === false) return;
      processsubcmd(cmdsinternal, noprefix, msg);
   }
}

function cmdhelpembed(cmd: Command) {
   return function(msg: Message) {
      const embed = new MessageEmbed();
      embed.setTitle(`Command ${cmd.name}`);
      msg.channel.send(embed);
   }
}

export function generatehelp(_cmds: ReadonlyArray<Command>): Command {
   // shallow clone so that i can sort it
   const cmds = [..._cmds].sort((a, b) => a.name.localeCompare(b.name));
   const subcommands: Array<Command> = [];

   cmds.forEach(c => {
      subcommands.push({
         name: c.name,
         exec: cmdhelpembed(c)
      })
   })

   return {
      name: "help",
      async exec(msg, arg) {
         const embed = new MessageEmbed();

         if (arg !== "") {
            embed.setTitle(`Command \`${arg}\` not found!`);
            return msg.channel.send(embed);
         }

         embed.setTitle("Command help");
         embed.setDescription(`run \`${await this.prefix(msg)}help <command>\` (replace \`<command>\` with the name of the command) for more help on a command`);
         cmds.forEach(c => {
            embed.addField(c.name, c.description ?? "no description available", true);
         });

         await msg.channel.send(embed);
      },
      subcommands
   }
}
