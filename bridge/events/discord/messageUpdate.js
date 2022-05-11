module.exports = async (discord, guilded, servers, newmsg) => {
	const srv = servers.find(s => s.discord.serverId == newmsg.guild.id);
	if (!srv) return;
	const bridge = srv.channels.find(b => b.discordId == newmsg.channel.id);
	if (!bridge || !bridge.messages[newmsg.id]) return;
	guilded.messages.edit(bridge.messages[newmsg.id], { content: `**${newmsg.author.tag}** ► ${newmsg.content}`, embeds: newmsg.embeds[0] });
};