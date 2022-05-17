const parseMentions = require('./parseMentions.js');
module.exports = function parseInEmbed(embeds, client, guild) {
	// literally can't find a better way to do this
	for (const i in embeds) {
		Object.keys(embeds[i].data).forEach(key => {
			if (typeof embeds[i].data[key] == 'string') return embeds[i].data[key] = parseMentions(embeds[i].data[key], client, guild);
			if (typeof embeds[i].data[key] == 'object') {
				if (embeds[i].data[key] instanceof Array) {
					for (const subkey in embeds[i].data[key]) {
						if (typeof embeds[i].data[key][subkey] == 'string') return embeds[i].data[key][subkey] = parseMentions(embeds[i].data[key][subkey], client, guild);
						if (typeof embeds[i].data[key][subkey] == 'object') {
							Object.keys(embeds[i].data[key][subkey]).forEach(subsubkey => {
								if (typeof embeds[i].data[key][subkey][subsubkey] == 'string') embeds[i].data[key][subkey][subsubkey] = parseMentions(embeds[i].data[key][subkey][subsubkey], client, guild);
							});
						}
					}
				}
				Object.keys(embeds[i].data[key]).forEach(subkey => {
					if (typeof embeds[i].data[key][subkey] == 'string') embeds[i].data[key][subkey] = parseMentions(embeds[i].data[key][subkey], client, guild);
				});
			}
		});
	}
};