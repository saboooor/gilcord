module.exports = async (discord, guilded, config, oldmsg, newmsg) => {
	const srv = config.servers.find(s => s.discord.serverId == newmsg.guild.id);
	if (!srv) return;
	const bridge = srv.channels.find(b => b.discord.channelId == newmsg.channel.id);
	if (!bridge || !bridge.messages[newmsg.id]) return;
	const { channelId, id } = bridge.messages[newmsg.id];
	const nameformat = (bridge.guilded.nameformat ?? srv.guilded.nameformat ?? config.guilded.nameformat).replace(/{name}/g, newmsg.author.tag);
	guilded.messages.update(channelId, id, { content: `${nameformat}${newmsg.content}`, embeds: newmsg.embeds[0] });
};