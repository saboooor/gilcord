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
    loadEvents(discord);
    loadEvents(guilded);
};

function loadEvents(client) {
    console.log(client)
}