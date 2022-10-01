const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');

module.exports = async (discord, guilded, item) => {
	// Check if list was created by client
	if (item.createdBy == guilded.user.id) return;

	// Get the server config and check if it exists
	const srv = config.servers.find(s => s.guilded.serverId == item.serverId);
	if (!srv || !srv.list) return;

	// Get the channel config and check if it exists
	const bridge = srv.list.find(b => b.guilded.channelId == item.channelId);
	if (!bridge) return;

	// Get the item author and check if it exists
	item.member = await discord.channels.fetch(`${item.serverId}:${item.createdBy}`).catch(() => { return null; });
	if (!item.member) return;

	// Create Embed with item info
	const ItemEmbed = new EmbedBuilder()
		.setColor(0x2f3136)
		.setTitle(item.message)
		.setTimestamp(Date.parse(item.createdAt));
	if (item.note && item.note.content) ItemEmbed.setDescription(item.note.content);

	// Create row with button to complete
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

	// Send message
	const channel = await discord.channels.fetch(bridge.discord.channelId);
	if (config.debug) discord.logger.info(`List item created from Guilded: ${JSON.stringify({ embeds: [ItemEmbed], components: [row] })}`);
	const msg = await channel.send({ embeds: [ItemEmbed], components: [row] });

	// Push the item in the json file
	const json = require(`../../../data/${srv.guilded.serverId}/list/${bridge.guilded.channelId}.json`);
	json.push({
		id: item.id,
		messageId: msg.id,
	});
	fs.writeFileSync(`./data/${srv.guilded.serverId}/list/${bridge.guilded.channelId}.json`, JSON.stringify(json));
};