module.exports = async (discord, guilded, config, oldmsg, newmsg) => {
	// Get the server config and check if it exists
	const srv = config.servers.find(s => s.discord.serverId == newmsg.guild.id);
	if (!srv) return;

	// Get the channel config and check if it and the cached message exists
	const bridge = srv.channels.find(b => b.discord.channelId == newmsg.channel.id);
	if (!bridge || !bridge.messages[newmsg.id]) return;

	// Get the nameformat from the configs
	const nameformat = (bridge.guilded.nameformat ?? srv.guilded.nameformat ?? config.guilded.nameformat).replace(/{name}/g, newmsg.author.tag);

	// Edit the message
	const { channelId, id } = bridge.messages[newmsg.id];
	guilded.messages.update(channelId, id, { content: `${nameformat}${newmsg.content}`, embeds: newmsg.embeds[0] });
};