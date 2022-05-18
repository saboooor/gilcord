module.exports = async (discord, guilded, config, message) => {
	// Get the server config and check if it exists
	const srv = config.servers.find(s => s.guilded.serverId == message.serverId);
	if (!srv) return;

	// Get the channel config and check if it and the cached message exists
	const bridge = srv.channels.find(b => b.guilded.channelId == message.channelId);
	if (!bridge || !bridge.messages) return;

	const cachedMessage = bridge.messages.find(m => m.guilded == message.id);
	if (!cachedMessage) return;

	// Delete the message and remove the cached message
	const channel = discord.channels.cache.get(bridge.discord.channelId);
	channel.messages.delete(cachedMessage.discord).catch(err => discord.logger.error(err));
	bridge.messages.splice(bridge.messages.indexOf(cachedMessage), 1);
};