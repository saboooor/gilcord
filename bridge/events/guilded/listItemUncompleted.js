const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = async (discord, guilded, item) => {
	// Get the server config and check if it exists
	const srv = config.servers.find(s => s.guilded.serverId == item.serverId);
	if (!srv || !srv.list) return;

	// Get the channel config and check if it exists
	const bridge = srv.list.find(b => b.guilded.channelId == item.channelId);
	if (!bridge) return;

	// Get the cached list item
	const json = require(`../../../data/${srv.guilded.serverId}/list/${bridge.guilded.channelId}.json`);
	const cacheditem = json.find(i => i.id == item.id);
	if (!cacheditem) return;

	// Get channel and message
	const channel = await discord.channels.fetch(bridge.discord.channelId);
	const message = await channel.messages.fetch(cacheditem.messageId);

	// Create row with button to uncomplete
	const row = new ActionRowBuilder()
		.addComponents([
			new ButtonBuilder()
				.setEmoji({ name: '🔲' })
				.setCustomId(`list_toggle_${item.id}`)
				.setStyle(ButtonStyle.Secondary),
			new ButtonBuilder()
				.setEmoji({ name: '📝' })
				.setCustomId(`list_note_${item.id}`)
				.setStyle(ButtonStyle.Secondary),
		]);

	if (config.debug) discord.logger.info(`List item uncompleteted from Guilded: ${JSON.stringify({ components: [row] })}`);
	message.edit({ components: [row] });
};