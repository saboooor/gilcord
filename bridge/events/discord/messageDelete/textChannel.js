module.exports = async (discord, guilded, config, message) => {
	// Get the server config and check if it exists
	const srv = config.servers.find(s => s.discord.serverId == message.guild.id);
	if (!srv) return;

	// Get the channel config and check if it and the cached message exists
	const bridge = srv.channels.find(b => b.discord.channelId == message.channel.id);
	if (!bridge || !bridge.messages) return;

	const cachedMessage = bridge.messages.find(m => m.discord == message.id);
	if (!cachedMessage) return;

	// Delete the message and remove the cached message
	guilded.messages.delete(bridge.guilded.channelId, cachedMessage.guilded).catch(err => guilded.logger.error(err));
	bridge.messages.splice(bridge.messages.indexOf(cachedMessage), 1);
};