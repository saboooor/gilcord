module.exports = async (discord, guilded, config, newmsg) => {
	// Get the server config and check if it exists
	const srv = config.servers.find(s => s.guilded.serverId == newmsg.serverId);
	if (!srv) return;

	// Get the channel config and check if it and the cached message exists
	const bridge = srv.channels.find(b => b.guilded.channelId == newmsg.channelId);
	if (!bridge) return;

	// Get the cached message and check if it exists	const json = require(`../../../../data/messages/${bridge.guilded.channelId}.json`);
	const json = require(`../../../data/messages/${bridge.guilded.channelId}.json`);
	const cachedMessage = json.find(m => m.guilded == newmsg.id);
	if (!cachedMessage || !cachedMessage.fromGuilded) return;

	// Parse all replies in the message
	const replies = [];
	if (newmsg.replyMessageIds[0]) {
		for (const replyId of newmsg.replyMessageIds) {
			if (json.find(m => m.guilded == replyId)) {
				const replyMsg = (await discord.channels.cache.get(bridge.discord.channelId).messages.fetch({ around: json.find(m => m.guilded == replyId).discord, limit: 1 })).first();
				if (replyMsg) replies.push(`${replyMsg.author} \`${replyMsg.content}\``);
			}
			else {
				const replyMsg = await guilded.messages.fetch(bridge.guilded.channelId, replyId).catch(err => guilded.logger.error(err));
				if (!replyMsg) return;
				replyMsg.member = guilded.members.cache.get(`${replyMsg.serverId}:${replyMsg.createdById}`);
				if (!replyMsg.member) replyMsg.member = await guilded.members.fetch(replyMsg.serverId, replyMsg.createdById).catch(err => guilded.logger.error(err));
				if (!replyMsg.member) replyMsg.member = { user: { name: replyMsg.createdById } };
				replies.push(`**${replyMsg.member.user.name}** \`${replyMsg.content}\``);
			}
		}
	}
	if (replies[0]) newmsg.content = `${replies.join('\n')}\n\n${newmsg.content}`;

	// Edit the message
	srv.discord.webhook.editMessage(
		cachedMessage.discord, {
			content: newmsg.content,
			embeds: newmsg.embeds,
		},
	);
};