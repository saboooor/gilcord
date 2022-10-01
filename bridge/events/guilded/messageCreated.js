const fs = require('fs');
const { parseGuilded } = require('../../functions/parse.js');
const { UserType } = require('guilded.js');

module.exports = async (discord, guilded, message) => {
	// Get the server config and check if it exists
	const srv = config.servers.find(s => s.guilded.serverId == message.serverId);
	if (!srv) return;

	// Check if the message is by the bot or has no content or embeds
	if (message.createdById == guilded.user.id || (!message.content && !message.raw.embeds)) return;

	// Get the channel config and check if it exists
	const bridge = srv.text.find(b => b.guilded.channelId == message.channelId);
	if (!bridge) return;

	// Get the message author and check if it exists
	message.member = await guilded.members.fetch(message.serverId, message.createdById).catch(() => { return null; });
	if (!message.member) return;

	// Check if the author is a bot and if the bot is allowed to send messages
	if (message.member.user.type == UserType.Bot && bridge.exempt_bots) return;

	// Get cached messages
	const json = require(`../../../data/${srv.guilded.serverId}/text/${bridge.guilded.channelId}.json`);

	// Parse all mentions on message content
	message.content = await parseGuilded(message.content);

	// Parse all replies in the message
	const replies = [];
	if (message.replyMessageIds[0]) {
		for (const replyId of message.replyMessageIds) {
			if (json.find(m => m.guilded == replyId)) {
				const discchannel = await discord.channels.fetch(bridge.discord.channelId);
				const replyMsg = await discchannel.messages.fetch(json.find(m => m.guilded == replyId).discord);
				if (replyMsg && replyMsg.author.id != bridge.discord.webhook.id) {
					replies.push(`${replyMsg.author} \`${replyMsg.content.replace(/\n/g, ' ').replace(/`/g, '\'')}\``);
					continue;
				}
			}
			const replyMsg = await guilded.messages.fetch(bridge.guilded.channelId, replyId).catch(() => { return null; });
			if (!replyMsg) return;
			replyMsg.member = await guilded.members.fetch(replyMsg.serverId, replyMsg.createdById).catch(() => { return null; });
			if (!replyMsg.member) replyMsg.member = { user: { name: replyMsg.createdById } };
			replies.push(`**${replyMsg.member.user.name}** \`${replyMsg.content.replace(/\n/g, ' ').replace(/`/g, '\'')}\``);
		}
	}
	if (replies.length) message.content = `${replies.join('\n')}\n\n${message.content}`;

	// Get the nameformat from the configs
	const nameformat = (bridge.discord.nameformat ?? srv.discord.nameformat ?? config.discord.nameformat).replace(/{name}/g, message.member.user.name);

	// Send the message	to the discord server
	const webhookopt = {
		avatarURL: message.member.user.avatar,
		username: nameformat,
		content: message.content,
		embeds: message.raw.embeds,
	};
	if (config.debug) discord.logger.info(`Message created from Guilded: ${JSON.stringify(webhookopt)}`);
	const discordmsg = await bridge.discord.webhook.send(webhookopt);

	// Cache the message for editing and deleting
	if (!config.message_cache || !config.message_cache.enabled) return;
	const obj = {
		guilded: message.id,
		discord: discordmsg.id,
		fromGuilded: true,
		created: Date.now(),
	};
	json.push(obj);
	if (config.debug) discord.logger.info(`Cached message from Guilded: ${JSON.stringify(obj)}`);
	fs.writeFileSync(`./data/${srv.guilded.serverId}/text/${bridge.guilded.channelId}.json`, JSON.stringify(json));

	// Delete old cached message if max messages is reached
	if (config.message_cache.max_messages && json.length > config.message_cache.max_messages) {
		if (config.debug) discord.logger.info(`Deleted old cached message from Guilded: ${JSON.stringify(json[0])}`);
		json.shift();
		fs.writeFileSync(`./data/${srv.guilded.serverId}/text/${bridge.guilded.channelId}.json`, JSON.stringify(json));
	}
};