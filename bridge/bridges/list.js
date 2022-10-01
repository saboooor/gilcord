const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');

module.exports = async (discord, guilded, discserver, srv) => {
	// Check if the list bridge on the server exists
	if (!srv.list) return;

	// Define the server's list channel data path
	const dataPath = `./data/${srv.guilded.serverId}/list`;

	// Create messages folder in data if it doesn't exist
	if (!fs.existsSync(dataPath)) fs.mkdirSync(dataPath, { recursive: true });

	// Iterate through every list bridge that's defined
	for (const bridge of srv.list) {
		// If the json doesnt exist create it
		if (!fs.existsSync(`${dataPath}/${bridge.guilded.channelId}.json`)) fs.writeFileSync(`${dataPath}/${bridge.guilded.channelId}.json`, '[]');

		// Get the channels
		const guilchannel = await guilded.channels.fetch(bridge.guilded.channelId);
		const discchannel = await discord.channels.fetch(bridge.discord.channelId);

		// Get all items in the channel
		const items = await guilchannel.getItems();

		// Iterate through the items
		for (const item of items) {
			// Load the json file
			const json = require(`../../${dataPath}/${bridge.guilded.channelId}.json`);

			// Check if the item already exists in the json and skip if so
			if (json.find(cachedItem => cachedItem.id == item.id)) continue;

			// Create embed with item info
			const ItemEmbed = new EmbedBuilder()
				.setColor(0x2f3136)
				.setTitle(item.message)
				.setTimestamp(Date.parse(item.updatedAt ?? item.createdAt));

			// If there's a note on the item, add it to the embed
			if (item.note && item.note.content) ItemEmbed.setDescription(item.note.content);

			// Create an action row with the buttons to interact with the item
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

			// Send the message with the item to the discord channal
			const msg = await discchannel.send({ embeds: [ItemEmbed], components: [row] });

			// Push the item in the json file
			json.push({
				id: item.id,
				messageId: msg.id,
			});

			// Write the new data into the json file
			fs.writeFileSync(`${dataPath}/${bridge.guilded.channelId}.json`, JSON.stringify(json));
		}
	}

	// Log
	discord.logger.info(`${discserver.name}'s list channel bridges have been loaded!`);
};