function sleep(ms) { return new Promise(res => setTimeout(res, ms)); }
const { MessageMentions: { ChannelsPattern, RolesPattern, UsersPattern } } = require('discord.js');
module.exports = async (discord, guilded, config, message) => {
	const srv = config.servers.find(s => s.discord.serverId == message.guild.id);
	if (!srv) return;
	const bridge = srv.channels.find(b => b.discord.channelId == message.channel.id);
	if (!bridge) return;
	if (message.author.id == discord.user.id || message.webhookId == srv.discord.webhook.id) return;
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
	const nameformat = (bridge.guilded.nameformat ?? srv.guilded.nameformat ?? config.guilded.nameformat).replace(/{name}/g, message.author.tag);
	const guildedmsg = await guilded.messages.send(bridge.guilded.channelId, { content: `${nameformat}${message.content}`, embeds: message.embeds[0] });
	if (!bridge.messages) bridge.messages = {};
	const { id, channelId } = guildedmsg;
	bridge.messages[message.id] = { id, channelId };
	await sleep(120000);
	delete bridge.messages[message.id];
};