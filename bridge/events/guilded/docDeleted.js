module.exports = async (discord, guilded, config, doc) => {
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

	// Get channel and delete the message from discord
	const channel = discord.channels.cache.get(docbridge.discord.channelId);
	if (config.debug) discord.logger.info(`Doc delete from Guilded: ${JSON.stringify(cacheddoc)}`);
	channel.messages.delete(cacheddoc.messageId).catch(err => discord.logger.error(err));
};