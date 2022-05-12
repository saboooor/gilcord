module.exports = async (discord, guilded, { servers }, message) => {
	const srv = servers.find(s => s.guilded.serverId == message.serverId);
	if (!srv) return;
	const bridge = srv.channels.find(b => b.guilded.channelId == message.channelId);
	if (!bridge || !bridge.messages[message.id]) return;
	srv.discord.webhook.deleteMessage(bridge.messages[message.id]);
	delete bridge.messages[message.id];
};