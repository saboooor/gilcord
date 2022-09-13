const parseMentions = require('./parseMentions.js');
module.exports = async function parseInEmbed(embeds, client, guild) {
	// literally can't find a better way to do this
	for (const i in embeds) {
		for (const key in embeds[i].data) {
			if (typeof embeds[i].data[key] == 'string') return embeds[i].data[key] = await parseMentions(embeds[i].data[key], client, guild);
			if (typeof embeds[i].data[key] == 'object') {
				if (embeds[i].data[key] instanceof Array) {
					for (const subkey in embeds[i].data[key]) {
						if (typeof embeds[i].data[key][subkey] == 'string') return embeds[i].data[key][subkey] = await parseMentions(embeds[i].data[key][subkey], client, guild);
						if (typeof embeds[i].data[key][subkey] == 'object') {
							for (const subsubkey in embeds[i].data[key][subkey]) {
								if (typeof embeds[i].data[key][subkey][subsubkey] == 'string') embeds[i].data[key][subkey][subsubkey] = await parseMentions(embeds[i].data[key][subkey][subsubkey], client, guild);
							}
						}
					}
				}
				for (const subkey in embeds[i].data[key]) {
					if (typeof embeds[i].data[key][subkey] == 'string') embeds[i].data[key][subkey] = await parseMentions(embeds[i].data[key][subkey], client, guild);
				}
			}
		}
	}
};