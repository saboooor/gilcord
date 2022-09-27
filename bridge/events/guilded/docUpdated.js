const { EmbedBuilder } = require('discord.js');
module.exports = async (discord, guilded, doc) => {
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
	const channel = discord.channels.cache.get(docbridge.discord.channelId);
	const message = await channel.messages.fetch(cacheddoc.messageId);

	// Create Embed with doc info
	const docEmbed = new EmbedBuilder(message.embeds[0].toJSON())
		.setColor(0x2f3136)
		.setTitle(doc.title)
		.setDescription(doc.content)
		.setTimestamp(Date.parse(doc.updatedAt));

	if (config.debug) discord.logger.info(`Doc update from Guilded: ${JSON.stringify({ embeds: [docEmbed] })}`);
	message.edit({ embeds: [docEmbed] });
};