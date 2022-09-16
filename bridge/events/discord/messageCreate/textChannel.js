function sleep(ms) { return new Promise(res => setTimeout(res, ms)); }
const fs = require('fs');
const parseMentions = require('../../../functions/parseMentions.js');
const parseInEmbed = require('../../../functions/parseInEmbed.js');
const { Embed } = require('guilded.js');
module.exports = async (discord, guilded, config, message) => {
	// Get the server config and check if it exists
	const srv = config.servers.find(s => s.discord.serverId == message.guild.id);
	if (!srv) return;

	// Get the channel config and check if it exists
	const bridge = srv.channels.find(b => b.discord.channelId == message.channel.id);
	if (!bridge) return;

	// Check if the message is by the bot or webhook
	if (message.author.id == discord.user.id || (bridge.discord.webhook && message.webhookId == bridge.discord.webhook.id)) return;

	// Check if the author is a bot and if the bot is allowed to send messages
	if (message.author.bot && bridge.exempt_bots) return;

	// Get cached messages
	let json = require(`../../../../data/messages/${bridge.guilded.channelId}.json`);

	// Parse all mentions on message content and embeds (literally can't find a better way to do the embed part)
	message.content = await parseMentions(message.content, discord, message.guild);
	await parseInEmbed(message.embeds, discord, message.guild);

	// Parse all replies in the message
	let reply;
	if (message.reference && message.reference.messageId) {
		const replyMsg = await discord.channels.cache.get(bridge.discord.channelId).messages.fetch(message.reference.messageId);
		const replyContent = await parseMentions(replyMsg.content, discord, message.guild);
		if (replyMsg) reply = `**${replyMsg.author.tag}** \`${replyContent.replace(/\n/g, ' ').replace(/`/g, '\'')}\``;
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

	// Send the message	to the discord server
	if (config.debug) guilded.logger.info(`Message created from Discord: ${reply ? `${reply}\n\n` : ''}${nameformat}${message.content}`);
	const guildedmsg = await bridge.guilded.webhook.send(`${reply ? `${reply}\n\n` : ''}${nameformat}${message.content}`);

	// Cache the message for editing and deleting
	if (!config.message_cache || !config.message_cache.enabled) return;
	const obj = {
		guilded: guildedmsg.id,
		discord: message.id,
		fromDiscord: true,
	};
	json.push(obj);
	if (config.debug) guilded.logger.info(`Cached message from Discord: ${JSON.stringify(obj)}`);
	fs.writeFileSync(`./data/messages/${bridge.guilded.channelId}.json`, JSON.stringify(json));

	// Delete old cached message if max messages is reached
	if (config.message_cache.max_messages && json.length > config.message_cache.max_messages) {
		if (config.debug) guilded.logger.info(`Deleted old cached message from Discord: ${JSON.stringify(json[0])}`);
		json.shift();
		fs.writeFileSync(`./data/messages/${bridge.guilded.channelId}.json`, JSON.stringify(json));
	}

	// Delete cached message after the amount of time specified in the config
	if (config.message_cache.timeout) {
		await sleep(config.message_cache.timeout * 1000);
		if (config.debug) guilded.logger.info(`Deleted old cached message from Discord: ${JSON.stringify(obj)}`);
		json = require(`../../../../data/messages/${bridge.guilded.channelId}.json`);
		json.splice(json.indexOf(obj), 1);
		fs.writeFileSync(`./data/messages/${bridge.guilded.channelId}.json`, JSON.stringify(json));
	}
};