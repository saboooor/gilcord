module.exports = async (discord, guilded, doc) => {
	// Check if doc was created by client
	if (doc.createdBy == guilded.user.id) return;

	// Get the server config and check if it exists
	const srv = config.servers.find(s => s.guilded.serverId == doc.serverId);
	if (!srv || !srv.docs) return;

	// Get the channel config and check if it exists
	const docbridge = srv.docs.find(b => b.guilded.channelId == doc.channelId);
	if (!docbridge) return;

	// Get the cached document
	const json = require(`../../../data/docs/${doc.channelId}.json`);
	const cacheddoc = json.docs.find(i => i.id == doc.id);
	if (!cacheddoc) return;

	// Get channel and message
	const thread = discord.channels.cache.get(cacheddoc.threadId);

	// Get the thread's initial message
	const starterMessage = await thread.fetchStarterMessage();

	if (config.debug) discord.logger.info(`Doc update from Guilded: ${JSON.stringify({ name: doc.title, content: doc.content })}`);
	await starterMessage.edit({ content: doc.content });
	await thread.edit({ name: doc.title });
};