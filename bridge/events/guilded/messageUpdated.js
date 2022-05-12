module.exports = async (discord, guilded, { servers }, newmsg) => {
	// Get the server config and check if it exists
	const srv = servers.find(s => s.guilded.serverId == newmsg.serverId);
	if (!srv) return;

	// Get the channel config and check if it and the cached message exists
	const bridge = srv.channels.find(b => b.guilded.channelId == newmsg.channelId);
	if (!bridge || !bridge.messages[newmsg.id]) return;

	// Edit the message
	srv.discord.webhook.editMessage(
		bridge.messages[newmsg.id], {
			content: newmsg.content,
			embeds: newmsg.embeds,
		},
	);
};