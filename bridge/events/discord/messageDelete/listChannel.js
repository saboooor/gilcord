const fs = require('fs');
module.exports = async (discord, guilded, { servers }, message) => {
	// Get the server config and check if it exists
	const srv = servers.find(s => s.discord.serverId == message.guild.id);
	if (!srv) return;

	// Get the channel config and check if it exists
	const listbridge = srv.lists.find(b => b.discord.channelId == message.channel.id);
	if (!listbridge) return;

	// Get the cached list item
	const json = require(`../../../../data/lists/${listbridge.guilded.channelId}.json`);
	const cacheditem = json.items.find(i => i.messageId == message.id);
	if (!cacheditem) return;

	// Delete the item and remove the cached item
	guilded.lists.delete(listbridge.guilded.channelId, cacheditem.id).catch(err => guilded.logger.error(err));
	json.items.splice(json.items.indexOf(cacheditem), 1);
	fs.writeFileSync(`./data/lists/${listbridge.guilded.channelId}.json`, JSON.stringify(json));
};