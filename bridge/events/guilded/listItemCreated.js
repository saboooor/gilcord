const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
module.exports = async (discord, guilded, config, item) => {
	// Check if list was created by client
	if (item.createdBy == guilded.user.id) return;

	// Get the server config and check if it exists
	const srv = config.servers.find(s => s.guilded.serverId == item.serverId);
	if (!srv) return;

	// Get the channel config and check if it exists
	const listbridge = srv.lists.find(b => b.guilded.channelId == item.channelId);
	if (!listbridge) return;

	// Get the item author and check if it exists
	item.member = guilded.members.cache.get(`${item.serverId}:${item.createdBy}`);
	if (!item.member) item.member = await guilded.members.fetch(item.serverId, item.createdBy).catch(err => guilded.logger.error(err));
	if (!item.member) return;

	// Create Embed with item info
	const ItemEmbed = new EmbedBuilder()
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
	const channel = discord.channels.cache.get(listbridge.discord.channelId);
	const msg = await channel.send({ embeds: [ItemEmbed], components: [row] });

	// Push the item in the json file
	const json = require(`../../../data/lists/${item.channelId}.json`);
	json.items.push({
		id: item.id,
		messageId: msg.id,
	});
	fs.writeFileSync(`./data/lists/${listbridge.guilded.channelId}.json`, JSON.stringify(json));
};