module.exports = async (discord, guilded, config, item) => {
	// Get the server config and check if it exists
	const srv = config.servers.find(s => s.guilded.serverId == item.serverId);
	if (!srv) return;

	// Get the channel config and check if it exists
	const listbridge = srv.lists.find(b => b.guilded.channelId == item.channelId);
	if (!listbridge) return;

	// Get the cached list item
	const json = require(`../../../data/lists/${item.channelId}.json`);
	const cacheditem = json.items.find(i => i.id == item.id);
	if (!cacheditem) return;

	// Get channel and delete the message from discord
	const channel = discord.channels.cache.get(listbridge.discord.channelId);
	channel.messages.delete(cacheditem.messageId).catch(err => discord.logger.error(err));
};