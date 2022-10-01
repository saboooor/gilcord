module.exports = async (discord, guilded, item) => {
	// Get the server config and check if it exists
	const srv = config.servers.find(s => s.guilded.serverId == item.serverId);
	if (!srv || !srv.list) return;

	// Get the channel config and check if it exists
	const bridge = srv.list.find(b => b.guilded.channelId == item.channelId);
	if (!bridge) return;

	// Get the cached list item
	const json = require(`../../../data/${srv.guilded.serverId}/list/${bridge.guilded.channelId}.json`);
	const cacheditem = json.find(i => i.id == item.id);
	if (!cacheditem) return;

	// Get channel and delete the message from discord
	const channel = await discord.channels.fetch(bridge.discord.channelId);
	if (config.debug) discord.logger.info(`List item deleted from Guilded: ${JSON.stringify(cacheditem)}`);
	channel.messages.delete(cacheditem.messageId).catch(err => discord.logger.error(err));
};