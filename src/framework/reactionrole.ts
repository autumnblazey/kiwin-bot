import { MessageReaction, PartialUser, User } from "discord.js";
import { Bot } from "./bot";

export type ReactionRole = {
   /** probably not needed, i think can fetch it from the channel */
   serverid?: string;
   channelid: string;
   messageid: string;

   /**
    * if its a default emoji, put the actual emoji here
    * if its a discord custom emoji, put the id
    */
   emoji: string;
   roleid: string;
};

export type ReactionRoleOpts = {
   bot: Bot;
   roles: ReadonlyArray<ReactionRole>;
};

type internalrolestorage = {
   [key: string]: undefined | ReactionRole
};

function makeinternal(roles: ReadonlyArray<ReactionRole>): internalrolestorage {
   const store: internalrolestorage = {};
   roles.forEach(role => store[rolekey(role)] = role);
   return store;
}

function rolekey(opts: {
   channelid: string;
   messageid: string;
   emoji: string;
}) {
   return `${opts.channelid} ${opts.messageid} ${opts.emoji}`;
}

export async function createreactionrolehandlers(opts: ReactionRoleOpts) {
   opts.bot.client.once("ready", async () => {
      for (const r of opts.roles) {
         const channel = await opts.bot.client.channels.fetch(r.channelid);
         // if (!(channel instanceof TextChannel))
         channel.isText() && channel.messages.fetch(r.messageid);
      }
   });

   const internalstore = makeinternal(opts.roles);

   async function preparerole(opts: {
      reaction: MessageReaction;
      user: User | PartialUser;
   }) {
      const reaction = opts.reaction.partial ? await opts.reaction.fetch() : opts.reaction;

      const guildmember = await reaction.message.guild?.members.fetch(opts.user.id);
      if (!guildmember) return false;

      const emoji = reaction.emoji.id !== null ? reaction.emoji.id : reaction.emoji.toString();
      const roletogive = internalstore[rolekey({
         channelid: reaction.message.channel.id,
         messageid: reaction.message.id,
         emoji
      })];
      if (!roletogive) return false;

      const role = await guildmember.guild.roles.fetch(roletogive.roleid);
      if (role === null) return false;

      return { guildmember, role };
   }

   return {
      add: async function(reaction: MessageReaction, user: User | PartialUser) {
         const stuff = await preparerole({ reaction, user });
         if (!stuff) return;

         const { guildmember, role } = stuff;
         if (guildmember.roles.cache.has(role.id)) return void console.log("alreaedy has");
         guildmember.roles.add(role);
      },
      remove: async function(reaction: MessageReaction, user: User | PartialUser) {
         const stuff = await preparerole({ reaction, user });
         if (!stuff) return;

         const { guildmember, role } = stuff;
         if (!guildmember.roles.cache.has(role.id)) return void console.log("no has");
         guildmember.roles.remove(role);
      }
   };
}
