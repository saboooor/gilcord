const { MessageMentions: { ChannelsPattern, RolesPattern, UsersPattern } } = require('discord.js');
module.exports = async (discord, guilded, servers, message) => {
	const srv = servers.find(s => s.discord.serverId == message.guild.id);
	if (!srv) return;
	const bridge = srv.channels.find(b => b.discordId == message.channel.id);
	if (!bridge) return;
	if (message.author.id == discord.user.id || message.webhookId == srv.discord.webhookId) return;
	const channelMatches = [...message.content.matchAll(ChannelsPattern)];
	channelMatches.forEach(match => {
		const channel = discord.channels.cache.get(match[1]);
		message.content = message.content.replace(match[0], `#${channel.name}`);
	});
	const roleMatches = [...message.content.matchAll(RolesPattern)];
	roleMatches.forEach(match => {
		const role = message.guild.roles.cache.get(match[1]);
		message.content = message.content.replace(match[0], `@${role.name}`);
	});
	const userMatches = [...message.content.matchAll(UsersPattern)];
	userMatches.forEach(match => {
		const user = discord.users.cache.get(match[1]);
		message.content = message.content.replace(match[0], `@${user.tag}`);
	});
	(message.channel.name == 'global' && message.author.bot && (message.embeds || message.content)) ?
		await guilded.messages.send(bridge.guildedId, { content: message.content ? message.content : undefined, embeds: message.embeds[0] ? message.embeds : undefined }) :
		await guilded.messages.send(bridge.guildedId, { content: `**${message.author.tag}** ► ${message.content}`, embeds: message.embeds [0] ? message.embeds : undefined });
	// You may replace the above 3 lines with:
	// await guilded.messages.send(guildedId, { content: `**${message.author.tag}** ► ${message.content}`, embeds: message.embeds });
	// I just have it this way for my own personal use, i don't think it'll affect anyone much
};