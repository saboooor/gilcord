const { bridges, discord: { webhookid } } = require('./config.json');
const D = require('discord.js');
module.exports = async (discord, guilded) => {
	const channels = Object.keys(bridges);
	const discwh = await discord.fetchWebhook(webhookid);
	const discwhclient = new D.WebhookClient({ id: webhookid, token: discwh.token });
	channels.forEach(async channel => {
		const guildedId = bridges[channel].g;
		const discordId = bridges[channel].d;
		discord.on('messageCreate', async message => {
			if (message.channel.id != discordId) return;
			if (message.author.id == discord.user.id) return;
			if (channel == 'global' && message.member.user.bot && (message.embeds || message.content)) guilded.messages.send(guildedId, { content: message.content ? message.content : undefined, embeds: message.embeds });
			else guilded.messages.send(guildedId, { content: `**${message.member.user.tag}** ► ${message.content}`, embeds: message.embeds });
		});
		guilded.on('messageCreated', async message => {
			if (message.channelId != guildedId) return;
			if (message.createdById == guilded.user.id) return;
			message.member = guilded.members.cache.get(`${message.serverId}:${message.createdById}`);
			if (!message.member) message.member = await guilded.members.fetch(message.serverId, message.createdById);
			await discwh.edit({ channel: discordId });
			await discwhclient.send({
				content: message.content,
				username: `Guilded • ${message.member.user.name}`,
				avatarURL: message.member.user.avatar,
			});
		});
	});
};