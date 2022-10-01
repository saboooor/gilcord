const { Embed } = require('guilded.js');
const { parseDiscord } = require('../../../functions/parse.js');
const parseInEmbeds = require('../../../functions/parseInEmbeds.js');

module.exports = async (discord, guilded, oldmsg, newmsg) => {
	// Get the server config and check if it exists
	const srv = config.servers.find(s => s.discord.serverId == newmsg.guild.id);
	if (!srv) return;

	// Get the channel config and check if it and the cached message exists
	const bridge = srv.text.find(b => b.discord.channelId == newmsg.channel.id);
	if (!bridge) return;

	// Get the cached message and check if it exists
	const json = require(`../../../../data/${srv.guilded.serverId}/text/${bridge.guilded.channelId}.json`);
	const cachedMessage = json.find(m => m.discord == newmsg.id);
	if (!cachedMessage || !cachedMessage.fromDiscord) return;

	newmsg.content = await parseDiscord(newmsg.content, discord, newmsg.guild);
	await parseInEmbeds(newmsg.embeds, discord, newmsg.guild);

	// Parse all replies in the messages
	let reply;
	if (newmsg.reference && newmsg.reference.messageId) {
		if (!json.find(m => m.discord == newmsg.reference.messageId)) {
			const discchannel = await discord.channels.fetch(bridge.discord.channelId);
			const replyMsg = await discchannel.messages.fetch(newmsg.reference.messageId);
			const replyContent = await parseDiscord(replyMsg.content, discord, newmsg.guild);
			if (replyMsg) reply = `**${replyMsg.author.tag}** \`${replyContent.replace(/\n/g, ' ').replace(/`/g, '\'')}\``;
		}
	}

	// Add an embed for any attachments
	const attachment = newmsg.attachments.first();
	if (attachment) {
		const imgurl = attachment.url;
		const attachEmbed = new Embed()
			.setColor(0x32343d)
			.setTitle('**Attachment**')
			.setDescription(`**[${attachment.name}](${imgurl})**`);
		if (attachment.contentType.split('/')[0] == 'image') attachEmbed.setImage(imgurl);
		newmsg.embeds.push(attachEmbed);
	}

	// Get the nameformat from the configs
	const nameformat = (bridge.guilded.nameformat ?? srv.guilded.nameformat ?? config.guilded.nameformat).replace(/{name}/g, newmsg.author.tag);

	// Edit the message
	if (config.debug) guilded.logger.info(`Message update from Discord: ${JSON.stringify({ content: `${reply ? `${reply}\n` : ''}${nameformat}${newmsg.content}`, embeds: newmsg.embeds[0] ? [newmsg.embeds[0]] : undefined })}`);
	guilded.messages.update(bridge.guilded.channelId, cachedMessage.guilded, { content: `${reply ? `${reply}\n` : ''}${nameformat}${newmsg.content}`, embeds: newmsg.embeds[0] ? [newmsg.embeds[0]] : undefined });
};