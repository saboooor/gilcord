module.exports = async (discord, guilded, config, newmsg) => {
	// Get the server config and check if it exists
	const srv = config.servers.find(s => s.guilded.serverId == newmsg.serverId);
	if (!srv) return;

	// Get the channel config and check if it and the cached message exists
	const bridge = srv.channels.find(b => b.guilded.channelId == newmsg.channelId);
	if (!bridge || !bridge.messages) return;

	const cachedMessage = bridge.messages.find(m => m.guilded == newmsg.id);
	if (!cachedMessage || !cachedMessage.fromGuilded) return;

	// Edit the message
	srv.discord.webhook.editMessage(
		cachedMessage.discord, {
			content: newmsg.content,
			embeds: newmsg.embeds,
		},
	);
};