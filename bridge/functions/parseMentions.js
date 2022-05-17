const { MessageMentions: { ChannelsPattern, RolesPattern, UsersPattern } } = require('discord.js');
const EmojisPattern = /(<a?)?(:\w+:)(\d{17,19})>/g;
module.exports = function parseMentions(text, client, guild) {
	let parsed = text;

	// Parse all channel mentions
	const channelMatches = [...text.matchAll(ChannelsPattern)];
	channelMatches.forEach(match => {
		const channel = client.channels.cache.get(match[1]);
		parsed = parsed.replace(match[0], `**#${channel.name}**`);
	});

	// Parse all role mentions
	const roleMatches = [...text.matchAll(RolesPattern)];
	roleMatches.forEach(match => {
		const role = guild.roles.cache.get(match[1]);
		parsed = parsed.replace(match[0], `**@${role.name}**`);
	});

	// Parse all user mentions
	const userMatches = [...text.matchAll(UsersPattern)];
	userMatches.forEach(match => {
		const user = client.users.cache.get(match[1]);
		parsed = parsed.replace(match[0], `**@${user.tag}**`);
	});

	// Parse all emoji mentions
	const emojiMatches = [...text.matchAll(EmojisPattern)];
	emojiMatches.forEach(match => {
		parsed = parsed.replace(match[0], match[2]);
	});

	return parsed;
};