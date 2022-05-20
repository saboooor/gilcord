const { PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const fs = require('fs');
module.exports = async (discord, guilded, config, message) => {
	// Get the server config and check if it exists
	const srv = config.servers.find(s => s.discord.serverId == message.guild.id);
	if (!srv || !srv.docs) return;

	// Get the channel config and check if it exists
	const docbridge = srv.docs.find(b => b.discord.channelId == message.channel.id);
	if (!docbridge) return;

	// Get the cached list item
	const json = require(`../../../../data/docs/${docbridge.guilded.channelId}.json`);
	const cacheddoc = json.docs.find(i => i.messageId == message.id);
	if (!cacheddoc) return;

	// Get the member who deleted the message
	const fetchedLogs = await message.guild.fetchAuditLogs({
		limit: 1,
		type: 72,
	});
	const log = fetchedLogs.entries.first();
	let member = message.guild.members.cache.get(log.executor.id);
	if (!member) member = await message.guild.members.fetch(log.executor.id);

	// Check if member has the required permission
	if (!member || !member.permissionsIn(message.channel).has(PermissionsBitField.Flags[docbridge.discord.permission])) {
		// Create row with buttons to complete and delete
		const row = new ActionRowBuilder()
			.addComponents([
				new ButtonBuilder()
					.setEmoji({ name: '📝' })
					.setCustomId(`doc_edit_${doc.id}`)
					.setStyle(ButtonStyle.Secondary),
			]);

		// Fetch the list item and check if it exists
		const doc = await guilded.docs.fetch(docbridge.guilded.channelId, cacheddoc.id);
		if (!doc) return;

		// Create embed
		const docEmbed = new EmbedBuilder()
			.setColor(0x2f3136)
			.setTitle(doc.title)
			.setDescription(doc.content)
			.setTimestamp(Date.parse(doc.updatedAt ?? doc.createdAt));

		// Re-send the mssage
		const msg = await message.channel.send({ embeds: [docEmbed], components: [row] });
		cacheddoc.messageId = msg.id;
		fs.writeFileSync(`./data/docs/${docbridge.guilded.channelId}.json`, JSON.stringify(json));
		return;
	}

	// Delete the item and remove the cached item
	guilded.docs.delete(docbridge.guilded.channelId, cacheddoc.id).catch(err => guilded.logger.error(err));
	json.docs.splice(json.docs.indexOf(cacheddoc), 1);
	fs.writeFileSync(`./data/lists/${docbridge.guilded.channelId}.json`, JSON.stringify(json));
};