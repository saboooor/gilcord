const { servers } = require('./config.json');
const D = require('discord.js');
module.exports = async (discord, guilded) => {
	const srvs = Object.keys(servers);
	srvs.forEach(async srvId => {
		const discserver = await discord.guilds.fetch(srvId);
		const discwh = (await discserver.fetchWebhooks()).get(servers[srvId].webhookid);
		const discwhclient = new D.WebhookClient({ id: servers[srvId].webhookid, token: discwh.token });

		const bridges = Object.keys(servers[srvId].bridges);
		bridges.forEach(async channelName => {
			const guildedId = servers[srvId].bridges[channelName].g;
			const discordId = servers[srvId].bridges[channelName].d;
			discord.on('messageCreate', async message => {
				if (message.channel.id != discordId || message.author.id == discord.user.id || message.webhookId == servers[srvId].webhookid) return;
				if (channelName == 'global' && message.author.bot && (message.embeds || message.content)) guilded.messages.send(guildedId, { content: message.content ? message.content : undefined, embeds: message.embeds });
				else guilded.messages.send(guildedId, { content: `**${message.author.tag}** ► ${message.content}`, embeds: message.embeds });
				discord.logger.info(`Message sent to ${guildedId} from ${discordId} (${channelName} bridge)`);
			});
			guilded.on('messageCreated', async message => {
				if (message.channelId != guildedId || message.createdById == guilded.user.id || (!message.content && !message.embeds)) return;
				message.member = guilded.members.cache.get(`${message.serverId}:${message.createdById}`);
				if (!message.member) message.member = await guilded.members.fetch(message.serverId, message.createdById);
				await discwh.edit({ channel: discordId });
				await discwhclient.send({
					content: message.content,
					username: `Guilded • ${message.member.user.name}`,
					avatarURL: message.member.user.avatar,
				});
				discord.logger.info(`Message sent to ${discordId} from ${guildedId} (${channelName} bridge)`);
			});
			discord.logger.info(`Loaded #${channelName} bridge`);
		});
		discord.logger.info(`Loaded ${discserver.name}'s bridges!`);
	});
};