module.exports = async (discord, guilded, thread) => {
	// Get the server config and check if it exists
	const srv = config.servers.find(s => s.discord.serverId == thread.guild.id);
	if (!srv || !srv.docs) return;

	// Get the channel config and check if it exists
	const docbridge = srv.docs.find(b => b.discord.channelId == thread.parent.id);
	if (!docbridge) return;

	// Get the cached document
	const json = require(`../../../../data/docs/${docbridge.guilded.channelId}.json`);
	const cacheddoc = json.docs.find(i => i.threadId == thread.id);
	if (!cacheddoc) return;

	// Delete the document and remove the cached doc
	if (config.debug) guilded.logger.info(`Doc title edit from Discord: ${JSON.stringify(cacheddoc)}`);
	guilded.docs.update(docbridge.guilded.channelId, cacheddoc.id, { title: thread.name });
};