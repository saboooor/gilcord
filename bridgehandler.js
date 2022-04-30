function sleep(ms) { return new Promise(res => setTimeout(res, ms)); }
const { servers } = require('./config.json');
const D = require('discord.js');
const { MessageMentions: { ChannelsPattern, RolesPattern, UsersPattern } } = require('discord.js');
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
				let guildedmsg = null;
				const channelMatches = [...message.content.matchAll(ChannelsPattern)];
				channelMatches.forEach(match => {
					const channel = discord.channels.cache.get(match[1]);
					message.content = message.content.replace(match[0], `#${channel.name}`);
				});
				const roleMatches = [...message.content.matchAll(RolesPattern)];
				roleMatches.forEach(match => {
					const role = discserver.roles.cache.get(match[1]);
					message.content = message.content.replace(match[0], `@${role.name}`);
				});
				const userMatches = [...message.content.matchAll(UsersPattern)];
				userMatches.forEach(match => {
					const user = discord.users.cache.get(match[1]);
					message.content = message.content.replace(match[0], `@${user.tag}`);
				});
				guildedmsg = (channelName == 'global' && message.author.bot && (message.embeds || message.content)) ?
					await guilded.messages.send(guildedId, { content: message.content ? message.content : undefined, embeds: message.embeds }) :
					await guilded.messages.send(guildedId, { content: `**${message.author.tag}** ► ${message.content}`, embeds: message.embeds });
				// You may replace the above 3 lines with:
				// guildedmsg = await guilded.messages.send(guildedId, { content: `**${message.author.tag}** ► ${message.content}`, embeds: message.embeds });
				// I just have it this way for my own personal use, i don't think it'll affect anyone much
				const updatefunc = async (oldmsg, newmsg) => {
					if (newmsg.id != message.id) return;
					guildedmsg.edit({ content: `**${newmsg.author.tag}** ► ${newmsg.content}`, embeds: newmsg.embeds });
				};
				discord.on('messageUpdate', updatefunc);
				await sleep(15000);
				discord.removeListener('messageUpdate', updatefunc);
			});
			guilded.on('messageCreated', async message => {
				if (message.channelId != guildedId || message.createdById == guilded.user.id || (!message.content && !message.raw.embeds)) return;
				message.member = guilded.members.cache.get(`${message.serverId}:${message.createdById}`);
				if (!message.member) message.member = await guilded.members.fetch(message.serverId, message.createdById);
				await discwh.edit({ channel: discordId });
				const discordmsg = await discwhclient.send({
					content: message.content,
					username: `Guilded • ${message.member.user.name}`,
					avatarURL: message.member.user.avatar,
					embeds: message.raw.embeds,
				});
				const updatefunc = async newmsg => {
					if (newmsg.id != message.id) return;
					discwh.editMessage(discordmsg.id, {
						content: newmsg.content,
						embeds: newmsg.embeds,
					});
				};
				guilded.on('messageUpdated', updatefunc);
				await sleep(15000);
				discord.removeListener('messageUpdate', updatefunc);
			});
			discord.logger.info(`Loaded #${channelName} bridge`);
		});
		discord.logger.info(`Loaded ${discserver.name}'s bridges!`);
	});
};