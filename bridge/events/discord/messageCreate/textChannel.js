const fs = require('fs');
const { parseDiscord } = require('../../../functions/parse.js');
const parseInEmbeds = require('../../../functions/parseInEmbeds.js');
const { Embed } = require('guilded.js');

module.exports = async (discord, guilded, message) => {
	// Get the server config and check if it exists
	const srv = config.servers.find(s => s.discord.serverId == message.guild.id);
	if (!srv) return;

	// Get the channel config and check if it exists
	const bridge = srv.text.find(b => b.discord.channelId == message.channel.id);
	if (!bridge) return;

	// Check if the message is by the bot or webhook
	if (message.author.id == discord.user.id || (bridge.discord.webhook && message.webhookId == bridge.discord.webhook.id)) return;

	// Check if the author is a bot and if the bot is allowed to send messages
	if (message.author.bot && bridge.exempt_bots) return;

	// Get cached messages
	const json = require(`../../../../data/${srv.guilded.serverId}/text/${bridge.guilded.channelId}.json`);

	// Parse all mentions on message content and embeds
	message.content = await parseDiscord(message.content, discord, message.guild);
	await parseInEmbeds(message.embeds, discord, message.guild);

	// Parse all replies in the message
	let reply, replyMessageIds;
	if (message.reference && message.reference.messageId) {
		if (json.find(m => m.discord == message.reference.messageId)) {
			replyMessageIds = [json.find(m => m.discord == message.reference.messageId).guilded];
		}
		else {
			const discchannel = await discord.channels.fetch(bridge.discord.channelId);
			const replyMsg = await discchannel.messages.fetch(message.reference.messageId);
			const replyContent = await parseDiscord(replyMsg.content, discord, message.guild);
			if (replyMsg) reply = `**${replyMsg.author.tag}** \`${replyContent.replace(/\n/g, ' ').replace(/`/g, '\'')}\``;
		}
	}

	// Add an embed if the message is a sticker
	const sticker = message.stickers.first();
	if (sticker) {
		const imgurl = sticker.url;
		if (imgurl.endsWith('json')) return discord.logger.info('Sticker is a JSON file, not supported yet, skipping...');
		const stickerEmbed = new Embed()
			.setTitle(`**Sticker:** ${sticker.name}`)
			.setImage(imgurl)
			.setColor(0x32343d);
		message.embeds.push(stickerEmbed);
	}

	// Add an embed for any attachments
	const attachment = message.attachments.first();
	if (attachment) {
		const imgurl = attachment.url;
		const attachEmbed = new Embed()
			.setColor(0x32343d)
			.setTitle('**Attachment**')
			.setDescription(`**[${attachment.name}](${imgurl})**`);
		if (attachment.contentType.split('/')[0] == 'image') attachEmbed.setImage(imgurl);
		message.embeds.push(attachEmbed);
	}

	// Get the nameformat from the configs
	const nameformat = (bridge.guilded.nameformat ?? srv.guilded.nameformat ?? config.guilded.nameformat).replace(/{name}/g, message.author.tag);

	// Send the message	to the guilded server
	const msg = { content: `${reply ? `${reply}\n` : ''}${nameformat}${message.content}`, embeds: message.embeds.length ? message.embeds : undefined, replyMessageIds };
	if (config.debug) guilded.logger.info(`Message create from Discord: ${JSON.stringify(msg)}`);
	const guildedmsg = await guilded.messages.send(bridge.guilded.channelId, msg);

	// Cache the message for editing and deleting
	if (!config.message_cache || !config.message_cache.enabled) return;
	const obj = {
		guilded: guildedmsg.id,
		discord: message.id,
		fromDiscord: true,
		created: Date.now(),
	};
	json.push(obj);
	if (config.debug) guilded.logger.info(`Cached message from Discord: ${JSON.stringify(obj)}`);
	fs.writeFileSync(`./data/${srv.guilded.serverId}/text/${bridge.guilded.channelId}.json`, JSON.stringify(json));

	// Delete old cached message if max messages is reached
	if (config.message_cache.max_messages && json.length > config.message_cache.max_messages) {
		if (config.debug) guilded.logger.info(`Deleted old cached message from Discord: ${JSON.stringify(json[0])}`);
		json.shift();
		fs.writeFileSync(`./data/${srv.guilded.serverId}/text/${bridge.guilded.channelId}.json`, JSON.stringify(json));
	}
};