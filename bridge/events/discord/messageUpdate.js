const { Embed } = require('guilded.js');
const parseMentions = require('../../functions/parseMentions.js');
const parseInEmbed = require('../../functions/parseInEmbed.js');
module.exports = async (discord, guilded, config, oldmsg, newmsg) => {
	// Get the server config and check if it exists
	const srv = config.servers.find(s => s.discord.serverId == newmsg.guild.id);
	if (!srv) return;

	// Get the channel config and check if it and the cached message exists
	const bridge = srv.channels.find(b => b.discord.channelId == newmsg.channel.id);
	if (!bridge || !bridge.messages[newmsg.id]) return;

	newmsg.content = parseMentions(newmsg.content, discord, newmsg.guild);
	parseInEmbed(newmsg.embeds, discord, newmsg.guild);

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
	const { channelId, id } = bridge.messages[newmsg.id];
	guilded.messages.update(channelId, id, { content: `${nameformat}${newmsg.content}`, embeds: newmsg.embeds[0] ? [newmsg.embeds[0]] : undefined });
};