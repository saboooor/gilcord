const { PermissionsBitField } = require('discord.js');
module.exports = async (discord, guilded, config, interaction) => {
	// Check if the interaction is a button
	if (!interaction.isButton()) return;

	// Get the listId and button from the customId
	const split = interaction.customId.split('_');
	const listId = split.pop();
	const buttonId = split.join('_');

	// Get the button from the available buttons in the bot
	const button = discord.buttons.get(buttonId);
	if (!button) return;

	// Get the server config and check if it exists
	const srv = config.servers.find(s => s.discord.serverId == interaction.guild.id);
	if (!srv || srv.lists) return;

	// Get the channel config and check if it exists
	const listbridge = srv.lists.find(b => b.discord.channelId == interaction.channel.id);
	if (!listbridge) return;

	// Check if member has the required permission
	if (!interaction.member.permissionsIn(interaction.channel).has(PermissionsBitField.Flags[listbridge.discord.permission])) return;

	// Fetch the list item and check if it exists
	const item = await guilded.lists.fetch(listbridge.guilded.channelId, listId);
	if (!item) return;

	// Defer and execute the button
	try { button.execute(discord, guilded, interaction, item); }
	catch (err) { discord.logger.error(err); }
};