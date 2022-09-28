const fs = require('fs');

module.exports = async (discord, guilded, doc) => {
	// Check if doc was created by client
	if (doc.createdBy == guilded.user.id) return;

	// Get the server config and check if it exists
	const srv = config.servers.find(s => s.guilded.serverId == doc.serverId);
	if (!srv || !srv.docs) return;

	// Get the channel config and check if it exists
	const docbridge = srv.docs.find(b => b.guilded.channelId == doc.channelId);
	if (!docbridge) return;

	// Get the Discord forum channel
	const channel = discord.channels.cache.get(docbridge.discord.channelId);

	// Split the doc content every 2000 characters
	const docContent = doc.content.match(/.{1,2000}/g);

	// Make the thread data with the first chunk if original content is over 2000 characters
	const threadData = {
		name: doc.title,
		message: { content: docContent.shift() },
	};

	// Create the discord thread
	if (config.debug) discord.logger.info(`Doc create from Guilded: ${JSON.stringify(threadData)}`);
	const thread = await channel.threads.create(threadData);

	// Send the remaining chunks if available
	if (docContent.length) discord.logger.warn('Sending multiple messages to discord since the doc is over 2000 characters, please use with care as this is still an unstable feature!');
	for (const content of docContent) await thread.send({ content });

	// Push the doc in the json file
	const json = require(`../../../data/docs/${doc.channelId}.json`);
	json.docs.push({
		id: doc.id,
		threadId: thread.id,
	});
	fs.writeFileSync(`./data/docs/${docbridge.guilded.channelId}.json`, JSON.stringify(json));
};