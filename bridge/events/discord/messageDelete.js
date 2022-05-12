module.exports = async (discord, guilded, { servers }, message) => {
	// Get the server config and check if it exists
	const srv = servers.find(s => s.discord.serverId == message.guild.id);
	if (!srv) return;

	// Get the channel config and check if it and the cached message exists
	const bridge = srv.channels.find(b => b.discord.channelId == message.channel.id);
	if (!bridge || !bridge.messages[message.id]) return;

	// Delete the message and remove the cached message
	const { channelId, id } = bridge.messages[message.id];
	guilded.messages.delete(channelId, id);
	delete bridge.messages[message.id];
};