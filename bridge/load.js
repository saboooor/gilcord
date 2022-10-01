const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');

module.exports = async (discord, guilded) => {
	// Create data folders if they don't exist
	if (!fs.existsSync('./data')) fs.mkdirSync('./data');

	// Load webhook clients and inject them into the servers object
	for (const srv of config.servers) {
		// Check if the serverIds are defined
		if (!srv.discord.serverId) return discord.logger.error('Discord serverId not defined in config!');
		if (!srv.guilded.serverId) return discord.logger.error('Guilded serverId not defined in config!');

		// Get the discord server and check if it exists
		const discserver = await discord.guilds.fetch(srv.discord.serverId).catch(err => discord.logger.error(err));
		if (!discserver) return discord.logger.error(`The Discord serverId ${srv.discord.serverId} doesn't exist!`);

		// Load text config
		if (srv.channels) {
			// Create messages folder in data
			if (!fs.existsSync('./data/messages')) fs.mkdirSync('./data/messages');

			// Fetch the Discord server's webhooks
			const discwebhooks = (await discserver.fetchWebhooks()).filter(w => w.owner.id == discord.user.id);
			for (const bridge of srv.channels) {
				// Create json files for data
				if (config.message_cache && config.message_cache.enabled && !fs.existsSync(`./data/messages/${bridge.guilded.channelId}.json`)) {
					fs.writeFileSync(`./data/messages/${bridge.guilded.channelId}.json`, '[]');
				}

				// Get the Guilded channel and check if it exists
				const guilchannel = await guilded.channels.fetch(bridge.guilded.channelId).catch(() => { return undefined; });
				if (!guilchannel) {
					discord.logger.error(`${discserver.name}'s Guilded channelId ${bridge.guilded.channelId} doesn't exist!`);
					continue;
				}

				// Get the Discord channel and check if it exists
				const discchannel = await discserver.channels.fetch(bridge.discord.channelId).catch(() => { return undefined; });
				if (!discchannel) {
					discord.logger.error(`${discserver.name}'s Discord channelId ${bridge.discord.channelId} doesn't exist!`);
					continue;
				}

				// Get the Discord channel's webhook
				let discwebhook = discwebhooks.find(w => w.channelId == bridge.discord.channelId);

				// If the webhook doesn't exist, create it
				if (!discwebhook) {
					discwebhook = await discchannel.createWebhook({ name: 'Guilded-Discord Bridge', reason: 'Webhook for Guilded-Discord Bridge' }).catch(err => discord.logger.error(err));
					if (!discwebhook) {
						discord.logger.error(`${discserver.name}'s #${discchannel.name} webhook wasn't found, and couldn't be created!`);
						continue;
					}
					discord.logger.warn(`${discserver.name}'s #${discchannel.name} webhook wasn't found, so it was created.`);
				}

				// Inject the webhook into the channel's object
				bridge.discord.webhook = discwebhook;
			}

			// Log
			discord.logger.info(`${discserver.name}'s text channel bridges have been loaded!`);
		}

		// Load list config
		if (srv.lists) {
			if (!fs.existsSync('./data/lists')) fs.mkdirSync('./data/lists');
			for (const list of srv.lists) {
				if (!fs.existsSync(`./data/lists/${list.guilded.channelId}.json`)) fs.writeFileSync(`./data/lists/${list.guilded.channelId}.json`, '{}');
				const guilchannel = await guilded.channels.fetch(list.guilded.channelId);
				const discchannel = await discord.channels.fetch(list.discord.channelId);
				const json = require(`../data/lists/${list.guilded.channelId}.json`);
				if (json.items) continue;
				const items = await guilchannel.getItems();
				json.items = [];
				for (const item of items) {
					const ItemEmbed = new EmbedBuilder()
						.setColor(0x2f3136)
						.setTitle(item.message)
						.setTimestamp(Date.parse(item.updatedAt ?? item.createdAt));
					if (item.note && item.note.content) ItemEmbed.setDescription(item.note.content);

					const row = new ActionRowBuilder()
						.addComponents([
							new ButtonBuilder()
								.setEmoji({ name: '🔲' })
								.setCustomId(`list_toggle_${item.id}`)
								.setStyle(ButtonStyle.Secondary),
							new ButtonBuilder()
								.setEmoji({ name: '📝' })
								.setCustomId(`list_note_${item.id}`)
								.setStyle(ButtonStyle.Secondary),
						]);

					const msg = await discchannel.send({ embeds: [ItemEmbed], components: [row] });

					// Push the item in the json file
					json.items.push({
						id: item.id,
						messageId: msg.id,
					});

				}
				fs.writeFileSync(`./data/lists/${list.guilded.channelId}.json`, JSON.stringify(json));
			}

			// Log
			discord.logger.info(`${discserver.name}'s list channel bridges have been loaded!`);
		}

		// Load doc config
		if (srv.docs) {
			if (!fs.existsSync('./data/docs')) fs.mkdirSync('./data/docs');
			for (const doclist of srv.docs) {
				if (!fs.existsSync(`./data/docs/${doclist.guilded.channelId}.json`)) fs.writeFileSync(`./data/docs/${doclist.guilded.channelId}.json`, '{}');
				const guilchannel = await guilded.channels.fetch(doclist.guilded.channelId);
				const discchannel = await discord.channels.fetch(doclist.discord.channelId);
				const json = require(`../data/docs/${doclist.guilded.channelId}.json`);
				if (json.docs) continue;
				const docs = await guilchannel.getDocs();
				const threads = (await discchannel.threads.fetchActive()).threads;
				json.docs = [];
				for (const doc of docs) {
					const thread = await discchannel.threads.create({
						name: doc.title,
						message: {
							content: doc.content,
						},
					});

					// Push the doc in the json file
					json.docs.push({
						id: doc.id,
						threadId: thread.id,
					});
				}
				for (const threadData of threads) {
					const thread = threadData[1];
					const starterMessage = await thread.fetchStarterMessage();
					const doc = await guilded.docs.create(doclist.guilded.channelId, { title: thread.name, content: starterMessage.content });

					// Push the doc in the json file
					json.docs.push({
						id: doc.id,
						threadId: thread.id,
					});
				}
				fs.writeFileSync(`./data/docs/${doclist.guilded.channelId}.json`, JSON.stringify(json));
			}

			// Log
			discord.logger.info(`${discserver.name}'s doc channel bridges have been loaded!`);
		}
	}

	// Load events
	[discord, guilded].forEach(client => {
		let count = 0;
		const files = fs.readdirSync(`./bridge/events/${client.type.name}/`);
		files.forEach(file => {
			if (!file.endsWith('.js')) {
				const subfiles = fs.readdirSync(`./bridge/events/${client.type.name}/${file}`).filter(subfile => subfile.endsWith('.js'));
				subfiles.forEach(subfile => {
					const event = require(`./events/${client.type.name}/${file}/${subfile}`);
					client.on(file, event.bind(null, discord, guilded));
					delete require.cache[require.resolve(`./events/${client.type.name}/${file}/${subfile}`)];
					count++;
				});
				return;
			}
			const event = require(`./events/${client.type.name}/${file}`);
			const eventName = file.split('.')[0];
			client.on(eventName, event.bind(null, discord, guilded));
			delete require.cache[require.resolve(`./events/${client.type.name}/${file}`)];
			count++;
		});
		client.logger.info(`${count} ${client.type.name} event listeners loaded`);
	});
};