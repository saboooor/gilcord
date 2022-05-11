module.exports = async (discord, guilded, servers, newmsg) => {
	const srv = servers.find(s => s.discord.serverId == newmsg.guild.id);
	if (!srv) return;
	const bridge = srv.channels.find(b => b.discordId == newmsg.channel.id);
	if (!bridge || !bridge.messages[newmsg.id]) return;
	console.log(bridge.messages[newmsg.id]);
};