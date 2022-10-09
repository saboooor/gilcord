module.exports = async (discord, guilded, doc) => {
	// Check if doc was created by client
	if (doc.createdBy == guilded.user.id) return;

	// Get the server config and check if it exists
	const srv = config.servers.find(s => s.guilded.serverId == doc.serverId);
	if (!srv || !srv.docs) return;

	// Get the channel config and check if it exists
	const bridge = srv.docs.find(b => b.guilded.channelId == doc.channelId);
	if (!bridge) return;

	// Get the cached document
	const json = require(`../../../data/${srv.guilded.serverId}/docs/${bridge.guilded.channelId}.json`);
	const cacheddoc = json.find(i => i.id == doc.id);
	if (!cacheddoc) return;

	// Get channel and message
	const thread = await discord.channels.fetch(cacheddoc.threadId);

	// Split the doc content every 2000 characters
	const docContent = doc.content.match(/((.|\n)*){1,2000}/g);

	// Get the thread's initial message
	const starterMessage = await thread.fetchStarterMessage();

	if (config.debug) discord.logger.info(`Doc update from Guilded: ${JSON.stringify({ name: doc.title, content: docContent[0] })}`);
	await starterMessage.edit({ content: docContent[0] });
	await thread.edit({ name: doc.title });
};