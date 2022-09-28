const { EmbedBuilder } = require('discord.js');
const parseMentions = require('./parseMentions.js');

module.exports = async function parseInEmbeds(embeds, client, guild) {
	for (const i in embeds) {
		const embedJSON = embeds[i].toJSON();
		if (embedJSON.author && embedJSON.author.name) embedJSON.author.name = await parseMentions(embedJSON.author.name, client, guild);
		if (embedJSON.title) embedJSON.title = await parseMentions(embedJSON.title, client, guild);
		if (embedJSON.description) embedJSON.description = await parseMentions(embedJSON.description, client, guild);
		if (embedJSON.footer && embedJSON.footer.text) embedJSON.footer.text = await parseMentions(embedJSON.footer.text, client, guild);
		if (embedJSON.fields) embedJSON.fields = embedJSON.fields.map(async f => { return { name: await parseMentions(f.name, client, guild), value: await parseMentions(f.value, client, guild) }; });
		embeds[i] = new EmbedBuilder(embedJSON);
	}
};