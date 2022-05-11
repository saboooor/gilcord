module.exports = async (discord, guilded, servers, newmsg) => {
	const srv = servers.find(s => s.guilded.serverId == newmsg.serverId);
	if (!srv) return;
	const bridge = srv.channels.find(b => b.guildedId == newmsg.channelId);
	if (!bridge || !bridge.messages[newmsg.id]) return;
	console.log(bridge.messages[newmsg.id]);
};