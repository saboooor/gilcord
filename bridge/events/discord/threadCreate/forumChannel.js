module.exports = async (discord, guilded, thread) => {
	// Check if the thread is by the bot
	if (thread.ownerId == discord.user.id) return;

	// Get the server config and check if it exists
	const srv = config.servers.find(s => s.discord.serverId == thread.guild.id);
	if (!srv || !srv.forums) return;

	// Get the channel config and check if it exists
	// const forumbridge = srv.forums.find(b => b.discord.channelId == channel.channel.id);
	// if (!forumbridge) return;
};