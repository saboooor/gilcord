const { ActivityType } = require('discord.js');
module.exports = (client, config) => {
	client.on('ready', async () => {
		client.logger.info('Bot started!');
		const timer = (Date.now() - client.startTimestamp) / 1000;
		client.logger.info(`Done (${timer}s)! I am running!`);

		// Set the activity on the discord client
		if (client.type.name != 'discord') return;
		if (config.discord.presence) {
			if (config.discord.presence.activity) await client.user.setPresence({ activities: [{ name: config.discord.presence.activity.name ?? 'https://github.com/saboooor/guilded-discord-bridge', type: ActivityType[config.discord.presence.activity.type ?? 'Watching'] }] });
			await client.user.setStatus(config.discord.presence.status ?? 'dnd');
		}
		else { client.user.setPresence({ activities: [{ name: 'https://github.com/saboooor/guilded-discord-bridge' }] }); }
	});
};