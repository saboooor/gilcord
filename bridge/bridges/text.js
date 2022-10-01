const { schedule } = require('node-cron');
const fs = require('fs');

module.exports = async (discord, guilded, discserver, srv) => {
	// Check if the text bridge on the server exists
	if (!srv.text) return;

	// Define the server's text channel data path
	const dataPath = `./data/${srv.guilded.serverId}/text`;

	// Create messages folder in data if it doesn't exist
	if (!fs.existsSync(dataPath)) fs.mkdirSync(dataPath, { recursive: true });

	// Fetch the Discord server's webhooks
	const discwebhooks = (await discserver.fetchWebhooks()).filter(w => w.owner.id == discord.user.id);
	for (const bridge of srv.text) {
		// Message cache things
		if (config.message_cache && config.message_cache.enabled) {
			// If the json doesnt exist create it
			if (!fs.existsSync(`${dataPath}/${bridge.guilded.channelId}.json`)) fs.writeFileSync(`${dataPath}/${bridge.guilded.channelId}.json`, '[]');

			// Register message timeout cron job if specified
			if (config.message_cache.timeout) {
				// Remove messages after the amount specified in config
				schedule('* * * * *', async () => {
					// Get the current JSON data
					const json = require(`../../${dataPath}/${bridge.guilded.channelId}.json`);

					// Iterate through every cached message
					for (const cachedMessage of json) {
						// Check if the message has been created over the amount of time specified in config and delete if so
						if (!cachedMessage.created || cachedMessage.created < Date.now + (config.message_cache.timeout * 60000)) {
							json.splice(json.indexOf(cachedMessage), 1);
							if (config.debug) discord.logger.info(`Deleted old cached message: ${JSON.stringify(cachedMessage)}`);
							fs.writeFileSync(`${dataPath}/${bridge.guilded.channelId}.json`, JSON.stringify(json));
						}
					}
				});
			}
		}

		// Get the Guilded channel and check if it exists
		const guilchannel = await guilded.channels.fetch(bridge.guilded.channelId).catch(() => { return undefined; });
		if (!guilchannel) {
			discord.logger.error(`${discserver.name}'s Guilded channelId ${bridge.guilded.channelId} doesn't exist!`);
			continue;
		}

		// Get the Discord channel and check if it exists
		const discchannel = await discserver.channels.fetch(bridge.discord.channelId).catch(() => { return undefined; });
		if (!discchannel) {
			discord.logger.error(`${discserver.name}'s Discord channelId ${bridge.discord.channelId} doesn't exist!`);
			continue;
		}

		// Get the Discord channel's webhook
		let discwebhook = discwebhooks.find(w => w.channelId == bridge.discord.channelId);

		// If the webhook doesn't exist, create it
		if (!discwebhook) {
			discwebhook = await discchannel.createWebhook({ name: 'Guilded-Discord Bridge', reason: 'Webhook for Guilded-Discord Bridge' }).catch(err => discord.logger.error(err));
			if (!discwebhook) {
				discord.logger.error(`${discserver.name}'s #${discchannel.name} webhook wasn't found, and couldn't be created!`);
				continue;
			}
			discord.logger.warn(`${discserver.name}'s #${discchannel.name} webhook wasn't found, so it was created.`);
		}

		// Inject the webhook into the channel's object
		bridge.discord.webhook = discwebhook;
	}

	// Log
	discord.logger.info(`${discserver.name}'s text channel bridges have been loaded!`);
};