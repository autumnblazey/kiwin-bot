import { Bot } from "./bot";
import { User, PartialUser, Client, MessageReaction, TextChannel } from "discord.js";

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

export async function createreactionrolehandler(opts: ReactionRoleOpts) {
   opts.bot.client.once("ready", async () => {
      for (const r of opts.roles) {
         const channel = await opts.bot.client.channels.fetch(r.channelid);
         // if (!(channel instanceof TextChannel))
         channel.isText() && channel.messages.fetch(r.messageid)
      }
   });

   const internalstore = makeinternal(opts.roles);

   return async function(reaction: MessageReaction, user: User | PartialUser) {
      if (reaction.partial) reaction = await reaction.fetch();
      // if (user.partial) user = await user.fetch();

      const guildmember = await reaction.message.guild?.members.fetch(user.id);
      if (!guildmember) return;

      const emoji = reaction.emoji.id !== null ? reaction.emoji.id : reaction.emoji.toString();
      const roletogive = internalstore[rolekey({
         channelid: reaction.message.channel.id,
         messageid: reaction.message.id,
         emoji
      })];
      if (!roletogive) return;

      const role = await guildmember.guild.roles.fetch(roletogive.roleid)
      if (role === null) return;
      if (guildmember.roles.cache.has(role.id)) return void console.log("hashrolwef");
      guildmember.roles.add(role);
   }
}
