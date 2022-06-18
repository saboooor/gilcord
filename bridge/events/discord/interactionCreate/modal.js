const { InteractionType } = require('discord.js');
module.exports = async (discord, guilded, config, interaction) => {
	// Check if the interaction is a modal
	if (interaction.type != InteractionType.ModalSubmit) return;

	// Get the target Id and modal Id from the customId
	const split = interaction.customId.split('_');
	const targetId = split.pop();
	const modalId = split.join('_');

	// Get the modal from the available modals in the bot
	const modal = discord.modals.get(modalId);
	if (!modal) return;

	// Get the server config and check if it exists
	const srv = config.servers.find(s => s.discord.serverId == interaction.guild.id);
	if (!srv) return;

	// Set the target
	let target;
	if (split[0] == 'list' && srv.lists) {
		// Get the channel config and check if it exists
		const listbridge = srv.lists.find(b => b.discord.channelId == interaction.channel.id);
		if (!listbridge) return;

		// Fetch the list item
		target = await guilded.lists.fetch(listbridge.guilded.channelId, targetId);
	}
	else if (split[0] == 'doc' && srv.docs) {
		// Get the channel config and check if it exists
		const docbridge = srv.docs.find(b => b.discord.channelId == interaction.channel.id);
		if (!docbridge) return;

		// Fetch the dicument
		target = await guilded.docs.fetch(docbridge.guilded.channelId, targetId);
	}
	if (!target) return;

	// Defer and execute the modal
	try {
		interaction.deferUpdate();
		modal.execute(discord, guilded, interaction, target);
	}
	catch (err) { discord.logger.error(err); }
};