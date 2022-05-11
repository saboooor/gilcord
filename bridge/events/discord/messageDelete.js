module.exports = async (discord, guilded, servers, message) => {
	const srv = servers.find(s => s.discord.serverId == message.guild.id);
	if (!srv) return;
	const bridge = srv.channels.find(b => b.discordId == message.channel.id);
	if (!bridge || !bridge.messages[message.id]) return;
	const { channelId, id } = bridge.messages[message.id];
	guilded.messages.delete(channelId, id);
	delete bridge.messages[message.id]
};