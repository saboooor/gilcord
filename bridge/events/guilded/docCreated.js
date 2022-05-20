const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
module.exports = async (discord, guilded, config, doc) => {
	// Check if doc was created by client
	if (doc.createdBy == guilded.user.id) return;

	// Get the server config and check if it exists
	const srv = config.servers.find(s => s.guilded.serverId == doc.serverId);
	if (!srv || !srv.docs) return;

	// Get the channel config and check if it exists
	const docbridge = srv.docs.find(b => b.guilded.channelId == doc.channelId);
	if (!docbridge) return;

	// Get the doc author and check if it exists
	doc.member = guilded.members.cache.get(`${doc.serverId}:${doc.createdBy}`);
	if (!doc.member) doc.member = await guilded.members.fetch(doc.serverId, doc.createdBy).catch(err => guilded.logger.error(err));
	if (!doc.member) return;

	// Create Embed with document
	const docEmbed = new EmbedBuilder()
		.setColor(0x2f3136)
		.setTitle(doc.title)
		.setDescription(doc.content)
		.setTimestamp(Date.parse(doc.createdAt));

	// Create row with button to complete
	const row = new ActionRowBuilder()
		.addComponents([
			new ButtonBuilder()
				.setEmoji({ name: '📝' })
				.setCustomId(`doc_edit_${doc.id}`)
				.setStyle(ButtonStyle.Secondary),
		]);

	// Send message
	const channel = discord.channels.cache.get(docbridge.discord.channelId);
	const msg = await channel.send({ embeds: [docEmbed], components: [row] });

	// Push the doc in the json file
	const json = require(`../../../data/docs/${doc.channelId}.json`);
	json.docs.push({
		id: doc.id,
		messageId: msg.id,
	});
	fs.writeFileSync(`./data/docs/${docbridge.guilded.channelId}.json`, JSON.stringify(json));
};