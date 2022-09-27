const fs = require('fs');
module.exports = async (discord, guilded, message) => {
	// Get the server config and check if it exists
	const srv = config.servers.find(s => s.guilded.serverId == message.serverId);
	if (!srv) return;

	// Get the channel config and check if it and the cached message exists
	const bridge = srv.channels.find(b => b.guilded.channelId == message.channelId);
	if (!bridge) return;

	// Get the cached message and check if it exists
	const json = require(`../../../data/messages/${bridge.guilded.channelId}.json`);
	const cachedMessage = json.find(m => m.guilded == message.id);
	if (!cachedMessage) return;

	// Delete the message and remove the cached message
	const channel = discord.channels.cache.get(bridge.discord.channelId);
	if (config.debug) discord.logger.info('Message delete from Guilded');
	channel.messages.delete(cachedMessage.discord).catch(err => discord.logger.error(err));
	json.splice(json.indexOf(cachedMessage), 1);
	fs.writeFileSync(`./data/messages/${bridge.guilded.channelId}.json`, JSON.stringify(json));
};