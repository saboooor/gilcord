const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
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

	// Create row with button to uncomplete
	const row = new ActionRowBuilder()
		.addComponents([
			new ButtonBuilder()
				.setEmoji({ name: '✅' })
				.setCustomId(`list_toggle_${item.id}`)
				.setStyle(ButtonStyle.Success),
			new ButtonBuilder()
				.setEmoji({ name: '📝' })
				.setCustomId(`list_note_${item.id}`)
				.setStyle(ButtonStyle.Secondary),
		]);

	if (config.debug) discord.logger.info(`List item completed from Guilded: ${JSON.stringify({ components: [row] })}`);
	message.edit({ components: [row] });
};