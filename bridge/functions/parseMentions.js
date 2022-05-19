const { MessageMentions: { ChannelsPattern, RolesPattern, UsersPattern } } = require('discord.js');
const EmojisPattern = /(<a?)?(:\w+:)(\d{17,19})>/g;
const longTimePattern = /<t:(\d{1,13})(:t)?(:R)?>/g;
const longTimeWeekdayPattern = /<t:(\d{1,13}):F>/g;
const numericDateOnlyTimePattern = /<t:(\d{1,13}):d>/g;
const dateOnlyTimePattern = /<t:(\d{1,13}):D>/g;
const shortTimePattern = /<t:(\d{1,13}):t>/g;
const shortTimeSecondsPattern = /<t:(\d{1,13}):T>/g;
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

	// Parse all timestamps
	const longTimeMatches = [...text.matchAll(longTimePattern)];
	longTimeMatches.forEach(match => {
		const date = new Date(parseInt(match[1] * 1000));
		const string = date.toLocaleString('default', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true });
		parsed = parsed.replace(match[0], `**${string}**`);
	});
	const longTimeWeekdayMatches = [...text.matchAll(longTimeWeekdayPattern)];
	longTimeWeekdayMatches.forEach(match => {
		const date = new Date(parseInt(match[1] * 1000));
		const string = date.toLocaleString('default', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true });
		parsed = parsed.replace(match[0], `**${string}**`);
	});
	const numericDateOnlyTimeMatches = [...text.matchAll(numericDateOnlyTimePattern)];
	numericDateOnlyTimeMatches.forEach(match => {
		const date = new Date(parseInt(match[1] * 1000));
		const string = date.toLocaleString('default', { month: 'numeric', day: 'numeric', year: 'numeric' });
		parsed = parsed.replace(match[0], `**${string}**`);
	});
	const dateOnlyTimeMatches = [...text.matchAll(dateOnlyTimePattern)];
	dateOnlyTimeMatches.forEach(match => {
		const date = new Date(parseInt(match[1] * 1000));
		const string = date.toLocaleString('default', { month: 'long', day: 'numeric', year: 'numeric' });
		parsed = parsed.replace(match[0], `**${string}**`);
	});
	const shortTimeMatches = [...text.matchAll(shortTimePattern)];
	shortTimeMatches.forEach(match => {
		const date = new Date(parseInt(match[1] * 1000));
		const string = date.toLocaleString('default', { hour: 'numeric', minute: 'numeric', hour12: true });
		parsed = parsed.replace(match[0], `**${string}**`);
	});
	const shortTimeSecondsMatches = [...text.matchAll(shortTimeSecondsPattern)];
	shortTimeSecondsMatches.forEach(match => {
		const date = new Date(parseInt(match[1] * 1000));
		const string = date.toLocaleString('default', { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true });
		parsed = parsed.replace(match[0], `**${string}**`);
	});

	// Return the parsed text
	return parsed;
};