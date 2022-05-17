function sleep(ms) { return new Promise(res => setTimeout(res, ms)); }
const parseMentions = require('../../functions/parseMentions.js');
const parseInEmbed = require('../../functions/parseInEmbed.js');
const { Embed } = require('guilded.js');
module.exports = async (discord, guilded, config, message) => {
	// Get the server config and check if it exists
	const srv = config.servers.find(s => s.discord.serverId == message.guild.id);
	if (!srv) return;

	// Check if the message is by the bot or webhook
	if (message.author.id == discord.user.id || message.webhookId == srv.discord.webhook.id) return;

	// Get the channel config and check if it exists
	const bridge = srv.channels.find(b => b.discord.channelId == message.channel.id);
	if (!bridge) return;

	// Parse all mentions on message content and embeds (literally can't find a better way to do the embed part)
	message.content = parseMentions(message.content, discord, message.guild);
	parseInEmbed(message.embeds, discord, message.guild);

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
	const guildedmsg = await guilded.messages.send(bridge.guilded.channelId, { content: `${nameformat}${message.content}`, embeds: message.embeds[0] ? [message.embeds[0]] : undefined });

	// Cache the message for editing and deleting
	if (!config.message_expiry) return;
	if (!bridge.messages) bridge.messages = {};
	const { id, channelId } = guildedmsg;
	bridge.messages[message.id] = { id, channelId };

	// Delete cached message after the amount of time specified in the config
	await sleep(config.message_expiry * 1000);
	delete bridge.messages[message.id];
};