const { EmbedBuilder } = require('discord.js');
module.exports = async (discord, guilded, config, doc) => {
	// Get the server config and check if it exists
	const srv = config.docs.find(s => s.guilded.serverId == doc.serverId);
	if (!srv || !srv.docs) return;

	// Get the channel config and check if it exists
	const listbridge = srv.docs.find(b => b.guilded.channelId == doc.channelId);
	if (!listbridge) return;

	// Get the cached document
	const json = require(`../../../data/lists/${doc.channelId}.json`);
	const cacheddoc = json.docs.find(i => i.id == doc.id);
	if (!cacheddoc) return;

	// Get channel and message
	const channel = discord.channels.cache.get(listbridge.discord.channelId);
	const message = (await channel.messages.fetch({ around: cacheddoc.messageId, limit: 1 })).first();

	// Create Embed with doc info
	const docEmbed = new EmbedBuilder(message.embeds[0].toJSON())
		.setColor(0x2f3136)
		.setTitle(doc.title)
		.setDescription(doc.content)
		.setTimestamp(Date.parse(doc.updatedAt));

	message.edit({ embeds: [docEmbed] });
};