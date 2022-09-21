module.exports = async (discord, guilded, config, channel) => {
	// Get the member from the ownerId
	const member = channel.guild.members.cache.get(channel.ownerId);

	// Check if the thread is by a bot
	if (member.bot) return;

	// Get the server config and check if it exists
	const srv = config.servers.find(s => s.discord.serverId == channel.guild.id);
	if (!srv/* || !srv.forums */) return;

	// Get the channel config and check if it exists
	// const forumbridge = srv.forums.find(b => b.discord.channelId == channel.channel.id);
	// if (!forumbridge) return;
};