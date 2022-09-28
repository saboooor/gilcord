const fs = require('fs');

module.exports = async (discord, guilded, thread) => {
	// Check if the thread is by the bot
	if (thread.ownerId == discord.user.id) return;

	// Get the server config and check if it exists
	const srv = config.servers.find(s => s.discord.serverId == thread.guild.id);
	if (!srv || !srv.docs) return;

	// Get the channel config and check if it exists
	const docbridge = srv.docs.find(b => b.discord.channelId == thread.parent.id);
	if (!docbridge) return;

	// Get the thread's initial message
	const starterMessage = await thread.fetchStarterMessage();

	// Create the guilded doc
	if (config.debug) guilded.logger.info(`Doc create from Discord: ${JSON.stringify({ title: thread.name, content: starterMessage.content })}`);
	const doc = await guilded.docs.create(docbridge.guilded.channelId, { title: thread.name, content: starterMessage.content });

	// Push the data in the json
	const json = require(`../../../../data/docs/${doc.channelId}.json`);
	json.docs.push({
		id: doc.id,
		threadId: thread.id,
	});
	fs.writeFileSync(`./data/docs/${doc.channelId}.json`, JSON.stringify(json));
};