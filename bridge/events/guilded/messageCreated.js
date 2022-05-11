module.exports = async (discord, guilded, servers, message) => {
	const srv = servers.find(s => s.guilded.serverId == message.serverId);
	if (!srv) return;
	const bridge = srv.channels.find(b => b.guildedId == message.channelId);
	if (!bridge) return;
	if (message.createdById == guilded.user.id || (!message.content && !message.raw.embeds)) return;
	message.member = guilded.members.cache.get(`${message.serverId}:${message.createdById}`);
	if (!message.member) message.member = await guilded.members.fetch(message.serverId, message.createdById).catch(err => guilded.logger.error(err));
	if (!message.member) return;
	srv.discord.webhook.edit({ channel: bridge.discordId });
	const discordmsg = await srv.discord.whclient.send({
		content: message.content,
		username: `Guilded • ${message.member.user.name}`,
		avatarURL: message.member.user.avatar,
		embeds: message.raw.embeds,
	});
	bridge.messages[message.id] = discordmsg.id;
};