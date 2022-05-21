const fs = require('fs');
module.exports = async (discord, guilded, config, message) => {
	// Get the server config and check if it exists
	const srv = config.servers.find(s => s.discord.serverId == message.guild.id);
	if (!srv || !srv.docs) return;

	// Get the channel config and check if it exists
	const docbridge = srv.docs.find(b => b.discord.channelId == message.channel.id);
	if (!docbridge) return;

	// Get the cached document
	const json = require(`../../../../data/docs/${docbridge.guilded.channelId}.json`);
	const cacheddoc = json.docs.find(i => i.messageId == message.id);
	if (!cacheddoc) return;

	// Get the member who deleted the message
	const fetchedLogs = await message.guild.fetchAuditLogs({
		limit: 1,
		type: 72,
	});
	const log = fetchedLogs.entries.first();
	let member = message.guild.members.cache.get(log.executor.id);
	if (!member) member = await message.guild.members.fetch(log.executor.id);

	// Delete the document and remove the cached doc
	if (config.debug) guilded.logger.info(`Doc delete from Discord: ${cacheddoc}`);
	guilded.docs.delete(docbridge.guilded.channelId, cacheddoc.id).catch(err => guilded.logger.error(err));
	json.docs.splice(json.docs.indexOf(cacheddoc), 1);
	fs.writeFileSync(`./data/docs/${docbridge.guilded.channelId}.json`, JSON.stringify(json));
};