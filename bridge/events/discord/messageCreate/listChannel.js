const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');
const fs = require('fs');

module.exports = async (discord, guilded, message) => {
	// Check if the message is by a bot
	if (message.author.bot) return;

	// Get the server config and check if it exists
	const srv = config.servers.find(s => s.discord.serverId == message.guild.id);
	if (!srv || !srv.list) return;

	// Get the channel config and check if it exists
	const bridge = srv.list.find(b => b.discord.channelId == message.channel.id);
	if (!bridge) return;

	// Delete the message
	message.delete();

	// Check if member has the required permission
	if (!message.member.permissionsIn(message.channel).has(PermissionsBitField.Flags[bridge.discord.permission])) return;

	// Create the guilded listitem
	const content = message.content.split('\n');
	const itemmsg = content.shift();
	const note = content.join('\n');
	if (config.debug) guilded.logger.info(`List item create from Discord: ${JSON.stringify({ message: itemmsg, note: note ? { content: note } : undefined })}`);
	const item = await guilded.lists.create(bridge.guilded.channelId, { message: itemmsg, note: note ? { content: note } : undefined });

	// Create Embed with item info
	const ItemEmbed = new EmbedBuilder()
		.setColor(0x2f3136)
		.setTitle(item.message)
		.setTimestamp(Date.parse(item.createdAt));
	if (note) ItemEmbed.setDescription(note);

	// Create row with buttons to complete and delete
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
	const msg = await message.channel.send({ embeds: [ItemEmbed], components: [row] });

	const json = require(`../../../../data/${srv.guilded.serverId}/list/${bridge.guilded.channelId}.json`);
	json.push({
		id: item.id,
		messageId: msg.id,
	});
	fs.writeFileSync(`./data/${srv.guilded.serverId}/list/${bridge.guilded.channelId}.json`, JSON.stringify(json));
};