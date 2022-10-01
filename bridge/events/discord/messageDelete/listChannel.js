const { PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = async (discord, guilded, message) => {
	// Get the server config and check if it exists
	const srv = config.servers.find(s => s.discord.serverId == message.guild.id);
	if (!srv || !srv.list) return;

	// Get the channel config and check if it exists
	const bridge = srv.list.find(b => b.discord.channelId == message.channel.id);
	if (!bridge) return;

	// Get the cached list item
	const json = require(`../../../../data/${srv.guilded.serverId}/list/${bridge.guilded.channelId}.json`);
	const cacheditem = json.find(i => i.messageId == message.id);
	if (!cacheditem) return;

	// Get the member who deleted the message
	const fetchedLogs = await message.guild.fetchAuditLogs({
		limit: 1,
		type: 72,
	});
	const log = fetchedLogs.entries.first();
	const member = await message.guild.members.fetch(log.executor.id);

	// Create row with buttons to complete and delete
	const row = new ActionRowBuilder()
		.addComponents([
			new ButtonBuilder()
				.setEmoji({ name: '🔲' })
				.setCustomId(`list_toggle_${cacheditem.id}`)
				.setStyle(ButtonStyle.Secondary),
			new ButtonBuilder()
				.setEmoji({ name: '📝' })
				.setCustomId(`list_note_${cacheditem.id}`)
				.setStyle(ButtonStyle.Secondary),
		]);

	// Check if member has the required permission
	if (!member || !member.permissionsIn(message.channel).has(PermissionsBitField.Flags[bridge.discord.permission])) {
		// Fetch the list item and check if it exists
		const item = await guilded.lists.fetch(bridge.guilded.channelId, cacheditem.id);
		if (!item) return;

		// Create embed
		const ItemEmbed = new EmbedBuilder()
			.setColor(0x2f3136)
			.setTitle(item.message)
			.setTimestamp(Date.parse(item.updatedAt ?? item.createdAt));
		if (item.note && item.note.content) ItemEmbed.setDescription(item.note.content);

		// Re-send the mssage
		const msg = await message.channel.send({ embeds: [ItemEmbed], components: [row] });
		cacheditem.messageId = msg.id;
		fs.writeFileSync(`./data/${srv.guilded.serverId}/list/${bridge.guilded.channelId}.json`, JSON.stringify(json));
		return;
	}

	// Delete the item and remove the cached item
	if (config.debug) guilded.logger.info(`List item delete from Discord: ${JSON.stringify(cacheditem)}`);
	await guilded.lists.delete(bridge.guilded.channelId, cacheditem.id).catch(async err => {
		// Log the error
		guilded.logger.error(err);

		// Fetch the list item and check if it exists
		const item = await guilded.lists.fetch(bridge.guilded.channelId, cacheditem.id);
		if (!item) return;

		// Create embed
		const ItemEmbed = new EmbedBuilder()
			.setColor(0x2f3136)
			.setTitle(item.message)
			.setTimestamp(Date.parse(item.updatedAt ?? item.createdAt));
		if (item.note && item.note.content) ItemEmbed.setDescription(item.note.content);

		// Re-send the mssage
		const msg = await message.channel.send({ embeds: [ItemEmbed], components: [row] });
		cacheditem.messageId = msg.id;
		fs.writeFileSync(`./data/${srv.guilded.serverId}/list/${bridge.guilded.channelId}.json`, JSON.stringify(json));
		return;
	});
	json.splice(json.indexOf(cacheditem), 1);
	fs.writeFileSync(`./data/${srv.guilded.serverId}/list/${bridge.guilded.channelId}.json`, JSON.stringify(json));
};