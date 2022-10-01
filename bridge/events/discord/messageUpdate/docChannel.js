module.exports = async (discord, guilded, oldmsg, newmsg) => {
	// Get the server config and check if it exists
	const srv = config.servers.find(s => s.discord.serverId == newmsg.guild.id);
	if (!srv || !srv.docs) return;

	// Get the channel config and check if it exists
	const bridge = srv.docs.find(b => b.discord.channelId == newmsg.channel.parent.id);
	if (!bridge) return;

	// Get the cached document
	const json = require(`../../../../data/${srv.guilded.serverId}/docs/${bridge.guilded.channelId}.json`);
	const cacheddoc = json.find(i => i.threadId == newmsg.channel.id);
	if (!cacheddoc) return;

	// Delete the document and remove the cached doc
	if (config.debug) guilded.logger.info(`Doc content edit from Discord: ${JSON.stringify(cacheddoc)}`);
	guilded.docs.update(bridge.guilded.channelId, cacheddoc.id, { title: newmsg.channel.name, content: newmsg.content });
};