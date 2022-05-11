module.exports = async (discord, guilded, servers, oldmsg, newmsg) => {
	const srv = servers.find(s => s.discord.serverId == newmsg.guild.id);
	if (!srv) return;
	const bridge = srv.channels.find(b => b.discordId == newmsg.channel.id);
	if (!bridge || !bridge.messages[newmsg.id]) return;
	const { channelId, id } = bridge.messages[newmsg.id];
	guilded.messages.update(channelId, id, { content: `**${newmsg.author.tag}** ► ${newmsg.content}`, embeds: newmsg.embeds[0] });
};