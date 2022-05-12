const fs = require('fs');
module.exports = async (discord, guilded, config) => {
	// Load webhook clients and inject them into the servers object
	config.servers.forEach(async srv => {
		if (!srv.discord.serverId) return discord.logger.error('Discord serverId not specified in config!');

		// Get the discord server and check if it exists
		const discserver = await discord.guilds.fetch(srv.discord.serverId).catch(err => discord.logger.error(err));
		if (!discserver) return discord.logger.error(`${srv.discord.serverId} Discord server Id doesn't exist!`);

		// Get the discord server's webhook and check if it exists
		let webhook = (await discserver.fetchWebhooks()).find(w => w.owner.id == discord.user.id);

		// If the webhook doesn't exist, create it
		if (!webhook) {
			const channel = discserver.channels.cache.filter(c => c.isText()).first();
			webhook = await channel.createWebhook('Guilded-Discord Bridge', { reason: 'Webhook for Guilded-Discord Bridge' }).catch(err => discord.logger.error(err));
			if (!webhook) return discord.logger.error(`${discserver.name}'s Webhook couldn't be created!`);
			else discord.logger.warn(`${discserver.name}'s Webhook wasn't found, so it was created.`);
		}

		// Inject the webhook into the server's discord object
		srv.discord = {
			serverId: discserver.id,
			webhook,
		};

		// Log
		discord.logger.info(`${discserver.name}'s Webhook loaded`);
	});

	// Load events
	[discord, guilded].forEach(client => {
		let count = 0;
		const files = fs.readdirSync(`./bridge/events/${client.type.name}/`);
		files.forEach(file => {
			if (!file.endsWith('.js')) return;
			const event = require(`./events/${client.type.name}/${file}`);
			const eventName = file.split('.')[0];
			client.on(eventName, event.bind(null, discord, guilded, config));
			delete require.cache[require.resolve(`./events/${client.type.name}/${file}`)];
			count++;
		});
		client.logger.info(`${count} event listeners loaded`);
	});
};