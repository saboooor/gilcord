const fs = require('fs');

module.exports = async (discord, guilded, doc) => {
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

	// Get channel and delete the message from discord
	const thread = await discord.channels.fetch(cacheddoc.threadId);

	// Delete the thread from the channel and remove the cached doc
	if (config.debug) discord.logger.info(`Doc delete from Guilded: ${JSON.stringify(cacheddoc)}`);
	thread.delete().catch(err => discord.logger.error(err));
	json.splice(json.indexOf(cacheddoc), 1);
	fs.writeFileSync(`./data/${srv.guilded.serverId}/docs/${bridge.guilded.channelId}.json`, JSON.stringify(json));
};