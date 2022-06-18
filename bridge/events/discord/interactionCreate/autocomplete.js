const { InteractionType } = require('discord.js');
module.exports = async (discord, guilded, config, interaction) => {
	// Check if the interaction is autocomplete
	if (interaction.type != InteractionType.autoComplete) return;

	// Get the command from the available commands in the bot
	const command = discord.commands.get(interaction.commandName);
	if (!command || !command.autoComplete) return;

	// Get the server config and check if it exists
	const srv = config.servers.find(s => s.discord.serverId == interaction.guild.id);
	if (!srv) return;

	// if autocomplete is set then execute it
	command.autoComplete(discord, guilded, interaction, srv);
};