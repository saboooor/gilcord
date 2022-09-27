const { ActivityType, SlashCommandBuilder } = require('discord.js');
module.exports = async (discord, guilded) => {
	// Set the activity on the discord client
	if (config.discord.presence) {
		if (config.discord.presence.activity) await discord.user.setPresence({ activities: [{ name: config.discord.presence.activity.name ?? 'https://github.com/saboooor/guilded-discord-bridge', type: ActivityType[config.discord.presence.activity.type ?? 'Watching'] }] });
		await discord.user.setStatus(config.discord.presence.status ?? 'dnd');
	}
	else { discord.user.setPresence({ activities: [{ name: 'https://github.com/saboooor/guilded-discord-bridge' }] }); }

	// Set slash commands
	config.servers.forEach(async server => {
		const guild = discord.guilds.cache.get(server.discord.serverId);
		const srccommands = (await guild.commands.fetch()).filter(c => c.applicationId == discord.user.id);
		await discord.commands.forEach(async command => {
			const cmd = new SlashCommandBuilder()
				.setName(command.name)
				.setDescription(command.description);
			if (command.options) command.options(cmd);


			const sourcecmd = srccommands.find(c => c.name == command.name);
			const desc = sourcecmd ? cmd.toJSON().description == sourcecmd.toJSON().description : false;
			if (desc) return;


			discord.logger.info(`Detected /${command.name} has some changes in ${guild.name}! Overwriting command...`);
			await guild.commands.create(cmd.toJSON());
		});
		await srccommands.forEach(async command => {
			if (discord.commands.find(c => c.name == command.name)) return;
			discord.logger.info(`Detected /${command.name} has been deleted! Deleting command...`);
			await command.delete();
		});
	});
};