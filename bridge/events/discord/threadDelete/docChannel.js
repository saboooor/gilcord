const fs = require('fs');

module.exports = async (discord, guilded, thread) => {
	// Get the server config and check if it exists
	const srv = config.servers.find(s => s.discord.serverId == thread.guild.id);
	if (!srv || !srv.docs) return;

	// Get the channel config and check if it exists
	const bridge = srv.docs.find(b => b.discord.channelId == thread.parent.id);
	if (!bridge) return;

	// Get the cached document
	const json = require(`../../../../data/${srv.guilded.serverId}/docs/${bridge.guilded.channelId}.json`);
	const cacheddoc = json.find(i => i.threadId == thread.id);
	if (!cacheddoc) return;

	// Delete the document and remove the cached doc
	if (config.debug) guilded.logger.info(`Doc delete from Discord: ${JSON.stringify(cacheddoc)}`);
	guilded.docs.delete(bridge.guilded.channelId, cacheddoc.id).catch(err => guilded.logger.error(err));
	json.splice(json.indexOf(cacheddoc), 1);
	fs.writeFileSync(`./data/${srv.guilded.serverId}/docs/${bridge.guilded.channelId}.json`, JSON.stringify(json));
};