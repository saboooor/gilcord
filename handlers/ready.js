const { ActivityType } = require('discord.js');
module.exports = (client, config) => {
	client.on('ready', () => {
		client.logger.info('Bot started!');
		const timer = (Date.now() - client.startTimestamp) / 1000;
		client.logger.info(`Done (${timer}s)! I am running!`);

		// Set the activity on the discord client
		if (client.type.name != 'discord') return;
		if (config.discord.presence) {
			if (config.discord.presence.status) client.user.setStatus(config.discord.presence.status);
			if (config.discord.presence.activity) client.user.setPresence({ activities: [{ name: config.discord.presence.activity.name ?? 'Guilded-Discord Bridge', type: ActivityType[config.discord.presence.activity.type ?? 'Playing'] }] });
		}
		else { client.user.setPresence({ activities: [{ name: 'Guilded-Discord Bridge', type: 'Playing' }] }); }
	});
};