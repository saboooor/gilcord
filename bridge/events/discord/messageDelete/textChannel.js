const fs = require('fs');

module.exports = async (discord, guilded, message) => {
	// Get the server config and check if it exists
	const srv = config.servers.find(s => s.discord.serverId == message.guild.id);
	if (!srv) return;

	// Get the channel config and check if it and the cached message exists
	const bridge = srv.text.find(b => b.discord.channelId == message.channel.id);
	if (!bridge) return;

	// Get the cached message and check if it exists
	const json = require(`../../../../data/${srv.guilded.serverId}/text/${bridge.guilded.channelId}.json`);
	const cachedMessage = json.find(m => m.discord == message.id);
	if (!cachedMessage) return;

	// Delete the message and remove the cached message
	if (config.debug) guilded.logger.info('Message delete from Discord');
	guilded.messages.delete(bridge.guilded.channelId, cachedMessage.guilded).catch(err => guilded.logger.error(err));
	json.splice(json.indexOf(cachedMessage), 1);
	fs.writeFileSync(`./data/${srv.guilded.serverId}/text/${bridge.guilded.channelId}.json`, JSON.stringify(json));
};