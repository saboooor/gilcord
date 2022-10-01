module.exports = async (discord, guilded, oldthread, newthread) => {
	// Get the server config and check if it exists
	const srv = config.servers.find(s => s.discord.serverId == newthread.guild.id);
	if (!srv || !srv.docs) return;

	// Get the channel config and check if it exists
	const bridge = srv.docs.find(b => b.discord.channelId == newthread.parent.id);
	if (!bridge) return;

	// Get the cached document
	const json = require(`../../../../data/${srv.guilded.serverId}/docs/${bridge.guilded.channelId}.json`);
	const cacheddoc = json.find(i => i.threadId == newthread.id);
	if (!cacheddoc) return;

	// Delete the document and remove the cached doc
	if (config.debug) guilded.logger.info(`Doc title edit from Discord: ${JSON.stringify(cacheddoc)}`);
	const starterMessage = await newthread.fetchStarterMessage();
	guilded.docs.update(bridge.guilded.channelId, cacheddoc.id, { title: newthread.name, content: starterMessage.content });
};