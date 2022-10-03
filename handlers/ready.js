const { ActivityType, SlashCommandBuilder } = require('discord.js');

module.exports = (client) => {
	client.on('ready', async () => {
		const timer = (Date.now() - client.startTimestamp) / 1000;
		client.logger.info(`Bot started (${timer}s)`);
		if (client.type.name != 'discord') return;

		// Set the activity on the discord client
		if (config.discord.presence) {
			if (config.discord.presence.activity) await client.user.setPresence({ activities: [{ name: config.discord.presence.activity.name ?? 'https://github.com/saboooor/Gilcord', type: ActivityType[config.discord.presence.activity.type ?? 'Watching'] }] });
			await client.user.setStatus(config.discord.presence.status ?? 'dnd');
		}
		else { client.user.setPresence({ activities: [{ name: 'https://github.com/saboooor/Gilcord' }] }); }

		// Set slash commands
		config.servers.forEach(async server => {
			const guild = await client.guilds.fetch(server.discord.serverId);
			const srccommands = (await guild.commands.fetch()).filter(c => c.applicationId == client.user.id);
			await client.commands.forEach(async command => {
				const cmd = new SlashCommandBuilder()
					.setName(command.name)
					.setDescription(command.description);
				if (command.options) command.options(cmd);


				const sourcecmd = srccommands.find(c => c.name == command.name);
				const desc = sourcecmd ? cmd.toJSON().description == sourcecmd.toJSON().description : false;
				if (desc) return;


				client.logger.info(`Detected /${command.name} has some changes in ${guild.name}! Overwriting command...`);
				await guild.commands.create(cmd.toJSON());
			});
			await srccommands.forEach(async command => {
				if (client.commands.find(c => c.name == command.name)) return;
				client.logger.info(`Detected /${command.name} has been deleted! Deleting command...`);
				await command.delete();
			});
		});
	});
};