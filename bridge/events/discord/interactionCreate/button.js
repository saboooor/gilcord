const { PermissionsBitField } = require('discord.js');

module.exports = async (discord, guilded, interaction) => {
	// Check if the interaction is a button
	if (!interaction.isButton()) return;

	// Get the target Id and button Id from the customId
	const split = interaction.customId.split('_');
	const targetId = split.pop();
	const buttonId = split.join('_');

	// Get the button from the available buttons in the bot
	const button = discord.buttons.get(buttonId);
	if (!button) return;

	// Get the server config and check if it exists
	const srv = config.servers.find(s => s.discord.serverId == interaction.guild.id);
	if (!srv) return;

	// Set the target
	let target;
	if (split[0] == 'list' && srv.list) {
		// Get the channel config and check if it exists
		const bridge = srv.list.find(b => b.discord.channelId == interaction.channel.id);
		if (!bridge) return;

		// Check if member has the required permission
		if (!interaction.member.permissionsIn(interaction.channel).has(PermissionsBitField.Flags[bridge.discord.permission])) return;

		// Fetch the list item
		target = await guilded.lists.fetch(bridge.guilded.channelId, targetId);
	}
	else if (split[0] == 'doc' && srv.docs) {
		// Get the channel config and check if it exists
		const bridge = srv.docs.find(b => b.discord.channelId == interaction.channel.id);
		if (!bridge) return;

		// Check if member has the required permission
		if (!interaction.member.permissionsIn(interaction.channel).has(PermissionsBitField.Flags.ManageMessages)) return;

		// Fetch the document
		target = await guilded.docs.fetch(bridge.guilded.channelId, targetId);
	}
	if (!target) return;

	// Defer and execute the button
	try { button.execute(discord, guilded, interaction, target); }
	catch (err) { discord.logger.error(err); }
};