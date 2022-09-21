const { MessageMentions: { ChannelsPattern, RolesPattern, UsersPattern } } = require('discord.js');
const EmojisPattern = /(<a?)?(:\w+:)(\d{17,19})>/g;
const longTimePattern = /<t:(\d{1,13})(:t)?(:R)?>/g;
const longTimeWeekdayPattern = /<t:(\d{1,13}):F>/g;
const numericDateOnlyTimePattern = /<t:(\d{1,13}):d>/g;
const dateOnlyTimePattern = /<t:(\d{1,13}):D>/g;
const shortTimePattern = /<t:(\d{1,13}):t>/g;
const shortTimeSecondsPattern = /<t:(\d{1,13}):T>/g;
const urlPattern = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/g;
module.exports = async function parseMentions(text, client, guild) {
	let parsed = text;

	// Parse all URLs to hyperlink
	const urlMatches = [...text.matchAll(urlPattern)];
	for (const match of urlMatches) parsed = parsed.replace(match[0], `[${match[0]}](${match[0]})`);

	// Parse all channel mentions
	const channelMatches = [...text.matchAll(new RegExp(ChannelsPattern, 'g'))];
	for (const match of channelMatches) {
		const channel = await client.channels.fetch(match[1]).catch(() => { return null; });
		if (!channel) {
			client.logger.warn(`Channel Id ${match[1]} wasn't found!`);
			parsed = parsed.replace(match[0], '**#Unknown Channel**');
			continue;
		}
		parsed = parsed.replace(match[0], `**#${channel.name}**`);
	}

	// Parse all role mentions
	const roleMatches = [...text.matchAll(new RegExp(RolesPattern, 'g'))];
	for (const match of roleMatches) {
		const role = await guild.roles.fetch(match[1]).catch(() => { return null; });
		if (!role) {
			client.logger.warn(`Role Id ${match[1]} wasn't found!`);
			parsed = parsed.replace(match[0], '**@Unknown Role**');
			continue;
		}
		parsed = parsed.replace(match[0], `**@${role.name}**`);
	}

	// Parse all user mentions
	const userMatches = [...text.matchAll(new RegExp(UsersPattern, 'g'))];
	for (const match of userMatches) {
		const user = await client.users.fetch(match[1]).catch(() => { return null; });
		if (!user) {
			client.logger.warn(`User Id ${match[1]} wasn't found!`);
			parsed = parsed.replace(match[0], '**@Unknown User**');
			continue;
		}
		parsed = parsed.replace(match[0], `**@${user.tag}**`);
	}

	// Parse all emoji mentions
	const emojiMatches = [...text.matchAll(EmojisPattern)];
	emojiMatches.forEach(match => parsed = parsed.replace(match[0], match[2]));

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