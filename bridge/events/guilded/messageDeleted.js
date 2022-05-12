module.exports = async (discord, guilded, { servers }, message) => {
	// Get the server config and check if it exists
	const srv = servers.find(s => s.guilded.serverId == message.serverId);
	if (!srv) return;

	// Get the channel config and check if it and the cached message exists
	const bridge = srv.channels.find(b => b.guilded.channelId == message.channelId);
	if (!bridge || !bridge.messages[message.id]) return;

	// Delete the message and remove the cached message
	srv.discord.webhook.deleteMessage(bridge.messages[message.id]);
	delete bridge.messages[message.id];
};