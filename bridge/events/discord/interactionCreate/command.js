module.exports = async (discord, guilded, config, interaction) => {
	// Check if interaction is command
	if (!interaction.isChatInputCommand()) return;

	// Get the command from the available commands in the bot
	const command = discord.commands.get(interaction.commandName);
	if (!command) return;

	// Get the server config and check if it exists
	const srv = config.servers.find(s => s.discord.serverId == interaction.guild.id);
	if (!srv) return;

	// execute command
	command.execute(discord, guilded, interaction, srv);
};