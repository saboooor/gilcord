const { servers } = require('../config.json');
const { WebhookClient } = require('discord.js');
const fs = require('fs');
module.exports = async (discord, guilded) => {
	// Load webhook clients and inject them into the servers object
	Object.keys(servers).forEach(async srvName => {
		const srv = servers[srvName];
		const discserver = await discord.guilds.fetch(srv.discord.serverId).catch(err => discord.logger.error(err));
		if (!discserver) return discord.logger.error(`${srvName} Discord server doesn't exist!`);
		const webhook = (await discserver.fetchWebhooks()).get(srv.discord.webhookId);
		if (!webhook) return discord.logger.error(`${srvName} Discord webhook doesn't exist!`);
		const whclient = new WebhookClient({ id: webhook.id, token: webhook.token });
		servers[srvName].discord = {
			serverId: discserver.id,
			webhook, whclient,
		};
		discord.logger.info(`${srvName} webhook loaded`);
	});

	// Load events
	[discord, guilded].forEach(client => {
		let count = 0;
		const files = fs.readdirSync(`./bridge/events/${client.type.name}/`);
		files.forEach(file => {
			if (!file.endsWith('.js')) return;
			const event = require(`./events/${client.type.name}/${file}`);
			const eventName = file.split('.')[0];
			client.on(eventName, event.bind(null, discord, guilded, servers));
			delete require.cache[require.resolve(`./events/${client.type.name}/${file}`)];
			count++;
		});
		client.logger.info(`${count} event listeners loaded`);
	});
};