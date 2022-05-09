const { servers } = require('../config.json');
const { WebhookClient } = require('discord.js');
const fs = require('fs');
module.exports = async (discord, guilded) => {
	const srvIds = Object.keys(servers);
	const srvs = {};
	srvIds.forEach(async srvId => {
		const discserver = await discord.guilds.fetch(srvId);
		const discwh = (await discserver.fetchWebhooks()).get(srvs[srvId].webhookid);
		srvs[srvId] = {
			discord: {
				webhook: discwh,
				client: new WebhookClient({ id: srvs[srvId].webhookid, token: discwh.token }),
			},
		};
		const bridges = Object.keys(srvs[srvId].bridges);
		bridges.forEach(async channelName => {
			srvs[srvId].channels[channelName] = {
				guilded: srvs[srvId].bridges[channelName].g,
				discord: srvs[srvId].bridges[channelName].d,
			};
			discord.logger.info(`Loaded #${channelName} bridge`);
		});
		discord.logger.info(`Loaded ${discserver.name}'s bridges!`);
	});
    loadEvents(discord, srvs);
    loadEvents(guilded, srvs);
};

function loadEvents(client, srvs) {
const files = fs.readdirSync(`./bridge/events/${client.type.name}/`);
	let count = 0;
	files.forEach(file => {
		if (!file.endsWith('.js')) return;
		const event = require(`../../events/${client.type.name}/${file}`);
		const eventName = file.split('.')[0];
		client.on(eventName, event.bind(null, client, srvs));
		delete require.cache[require.resolve(`../../events/${client.type.name}/${file}`)];
		count++;
	});
	client.logger.info(`${count} event listeners loaded`);
}
