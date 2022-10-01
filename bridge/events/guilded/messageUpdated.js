module.exports = async (discord, guilded, newmsg) => {
	// Get the server config and check if it exists
	const srv = config.servers.find(s => s.guilded.serverId == newmsg.serverId);
	if (!srv) return;

	// Get the channel config and check if it and the cached message exists
	const bridge = srv.text.find(b => b.guilded.channelId == newmsg.channelId);
	if (!bridge) return;

	// Get the cached message and check if it exist
	const json = require(`../../../data/${srv.guilded.serverId}/text/${bridge.guilded.channelId}.json`);
	const cachedMessage = json.find(m => m.guilded == newmsg.id);
	if (!cachedMessage || !cachedMessage.fromGuilded) return;

	// Parse all replies in the message
	const replies = [];
	if (newmsg.replyMessageIds[0]) {
		for (const replyId of newmsg.replyMessageIds) {
			if (json.find(m => m.guilded == replyId)) {
				const discchannel = await discord.channels.fetch(bridge.discord.channelId);
				const replyMsg = await discchannel.messages.fetch(json.find(m => m.guilded == replyId).discord);
				if (replyMsg) replies.push(`${replyMsg.author} \`${replyMsg.content.replace(/\n/g, ' ').replace(/`/g, '\'')}\``);
			}
			else {
				const replyMsg = await guilded.messages.fetch(bridge.guilded.channelId, replyId).catch(() => { return null; });
				if (!replyMsg) return;
				replyMsg.member = await guilded.members.fetch(replyMsg.serverId, replyMsg.createdById).catch(() => { return null; });
				if (!replyMsg.member) replyMsg.member = { user: { name: replyMsg.createdById } };
				replies.push(`**${replyMsg.member.user.name}** \`${replyMsg.content.replace(/\n/g, ' ').replace(/`/g, '\'')}\``);
			}
		}
	}
	if (replies[0]) newmsg.content = `${replies.join('\n')}\n\n${newmsg.content}`;

	// Edit the message
	if (config.debug) discord.logger.info(`Message updated from Guilded ${JSON.stringify({ content: newmsg.content, embeds: newmsg.embeds })}`);

	await bridge.discord.webhook.editMessage(
		cachedMessage.discord,
		{ content: newmsg.content, embeds: newmsg.embeds },
	);
};