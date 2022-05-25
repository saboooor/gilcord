const { EmbedBuilder } = require('discord.js');
module.exports = async (discord, guilded, config, item) => {
	// Get the server config and check if it exists
	const srv = config.servers.find(s => s.guilded.serverId == item.serverId);
	if (!srv || !srv.lists) return;

	// Get the channel config and check if it exists
	const listbridge = srv.lists.find(b => b.guilded.channelId == item.channelId);
	if (!listbridge) return;

	// Get the cached list item
	const json = require(`../../../data/lists/${item.channelId}.json`);
	const cacheditem = json.items.find(i => i.id == item.id);
	if (!cacheditem) return;

	// Get channel and message
	const channel = discord.channels.cache.get(listbridge.discord.channelId);
	const message = (await channel.messages.fetch({ around: cacheditem.messageId, limit: 1 })).first();

	// Create Embed with item info
	const ItemEmbed = new EmbedBuilder(message.embeds[0].toJSON())
		.setColor(0x2f3136)
		.setTitle(item.message)
		.setTimestamp(Date.parse(item.updatedAt));
	if (item.note && item.note.content) ItemEmbed.setDescription(item.note.content);

	if (config.debug) discord.logger.info(`List item updated from Guilded: ${JSON.stringify({ embeds: [ItemEmbed] })}`);
	message.edit({ embeds: [ItemEmbed] });
};