const { EmbedBuilder } = require('discord.js');
const { parseDiscord } = require('./parse.js');

module.exports = async function parseInEmbeds(embeds, client, guild) {
	for (const i in embeds) {
		const embedJSON = embeds[i].toJSON();
		if (embedJSON.author && embedJSON.author.name) embedJSON.author.name = await parseDiscord(embedJSON.author.name, client, guild);
		if (embedJSON.title) embedJSON.title = await parseDiscord(embedJSON.title, client, guild);
		if (embedJSON.description) embedJSON.description = await parseDiscord(embedJSON.description, client, guild);
		if (embedJSON.footer && embedJSON.footer.text) embedJSON.footer.text = await parseDiscord(embedJSON.footer.text, client, guild);
		if (embedJSON.fields) embedJSON.fields = embedJSON.fields.map(async f => { return { name: await parseDiscord(f.name, client, guild), value: await parseDiscord(f.value, client, guild) }; });
		embeds[i] = new EmbedBuilder(embedJSON);
	}
};