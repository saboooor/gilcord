function sleep(ms) { return new Promise(res => setTimeout(res, ms)); }
module.exports = async (discord, guilded, config, message) => {
	const srv = config.servers.find(s => s.guilded.serverId == message.serverId);
	if (!srv) return;
	const bridge = srv.channels.find(b => b.guildedId == message.channelId);
	if (!bridge) return;
	if (message.createdById == guilded.user.id || (!message.content && !message.raw.embeds)) return;
	message.member = guilded.members.cache.get(`${message.serverId}:${message.createdById}`);
	if (!message.member) message.member = await guilded.members.fetch(message.serverId, message.createdById).catch(err => guilded.logger.error(err));
	if (!message.member) return;
	await srv.discord.webhook.edit({ channel: bridge.discordId });
	const nameformat = (bridge.discord.nameformat ?? srv.discord.nameformat ?? config.discord.nameformat).replace(/{name}/g, message.member.user.name);
	const discordmsg = await srv.discord.whclient.send({
		content: message.content,
		username: nameformat,
		avatarURL: message.member.user.avatar,
		embeds: message.raw.embeds,
	});
	if (!bridge.messages) bridge.messages = {};
	bridge.messages[message.id] = discordmsg.id;
	await sleep(120000);
	delete bridge.messages[message.id];
};