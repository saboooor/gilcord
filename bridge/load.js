const fs = require('fs');

module.exports = async (discord, guilded) => {
	// Iterate through all the servers defined in the config
	for (const srv of config.servers) {
		// Check if the serverIds are defined
		if (!srv.discord.serverId) return discord.logger.error('Discord serverId not defined in config!');
		if (!srv.guilded.serverId) return discord.logger.error('Guilded serverId not defined in config!');

		// Get the discord server and check if it exists
		const discserver = await discord.guilds.fetch(srv.discord.serverId).catch(err => discord.logger.error(err));
		if (!discserver) return discord.logger.error(`The Discord serverId ${srv.discord.serverId} doesn't exist!`);

		const files = fs.readdirSync('./bridge/bridges/');
		files.forEach(file => require(`./bridges/${file}`)(discord, guilded, discserver, srv));
	}

	// Load events
	for (const client of [discord, guilded]) {
		let count = 0;
		const files = fs.readdirSync(`./bridge/events/${client.type.name}/`);
		files.forEach(file => {
			if (!file.endsWith('.js')) {
				const subfiles = fs.readdirSync(`./bridge/events/${client.type.name}/${file}`).filter(subfile => subfile.endsWith('.js'));
				subfiles.forEach(subfile => {
					const event = require(`./events/${client.type.name}/${file}/${subfile}`);
					client.on(file, event.bind(null, discord, guilded));
					delete require.cache[require.resolve(`./events/${client.type.name}/${file}/${subfile}`)];
					count++;
				});
				return;
			}
			const event = require(`./events/${client.type.name}/${file}`);
			const eventName = file.split('.')[0];
			client.on(eventName, event.bind(null, discord, guilded));
			delete require.cache[require.resolve(`./events/${client.type.name}/${file}`)];
			count++;
		});
		client.logger.info(`${count} ${client.type.name} event listeners loaded`);
	}
};