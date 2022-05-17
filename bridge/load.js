const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
module.exports = async (discord, guilded, config) => {
	// Load webhook clients and inject them into the servers object
	config.servers.forEach(async srv => {
		if (!srv.discord.serverId) return discord.logger.error('Discord serverId not specified in config!');

		// Get the discord server and check if it exists
		const discserver = await discord.guilds.fetch(srv.discord.serverId).catch(err => discord.logger.error(err));
		if (!discserver) return discord.logger.error(`${srv.discord.serverId} Discord server Id doesn't exist!`);

		// Get the discord server's webhook and check if it exists
		let webhook = (await discserver.fetchWebhooks()).find(w => w.owner.id == discord.user.id);

		// If the webhook doesn't exist, create it
		if (!webhook) {
			const channel = discserver.channels.cache.filter(c => c.isText()).first();
			webhook = await channel.createWebhook('Guilded-Discord Bridge', { reason: 'Webhook for Guilded-Discord Bridge' }).catch(err => discord.logger.error(err));
			if (!webhook) return discord.logger.error(`${discserver.name}'s Webhook couldn't be created!`);
			else discord.logger.warn(`${discserver.name}'s Webhook wasn't found, so it was created.`);
		}

		// Inject the webhook into the server's discord object
		srv.discord = {
			serverId: discserver.id,
			webhook,
		};

		// Log
		discord.logger.info(`${discserver.name}'s Webhook loaded`);

		// Load list config
		if (srv.lists) {
			if (!fs.existsSync('./data')) fs.mkdirSync('./data');
			if (!fs.existsSync('./data/lists')) fs.mkdirSync('./data/lists');
			for (const list of srv.lists) {
				if (!fs.existsSync(`./data/lists/${list.guilded.channelId}.json`)) fs.writeFileSync(`./data/lists/${list.guilded.channelId}.json`, '{}');
				const guilchannel = await guilded.channels.fetch(list.guilded.channelId);
				const discchannel = await discord.channels.cache.get(list.discord.channelId);
				const json = require(`../data/lists/${list.guilded.channelId}.json`);
				if (!json.items) {
					const items = await guilchannel.getItems();
					json.items = [];
					for (const item of items) {
						let member = guilded.members.cache.get(`${item.serverId}:${item.createdBy}`);
						if (!member) member = await guilded.members.fetch(item.serverId, item.createdBy).catch(err => guilded.logger.error(err));

						const ItemEmbed = new EmbedBuilder()
							.setTitle(item.message)
							.setTimestamp(Date.parse(item.updatedAt ?? item.createdAt));
						if (item.note && item.note.content) ItemEmbed.setDescription(item.note.content);
						if (member) ItemEmbed.setAuthor({ name: member.user.name, iconURL: member.user.avatar });

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

						json.items.push({
							id: item.id,
							messageId: msg.id,
						});

					}
					fs.writeFileSync(`./data/lists/${list.guilded.channelId}.json`, JSON.stringify(json));
				}
			}
		}
	});

	// Load events
	[discord, guilded].forEach(client => {
		let count = 0;
		const files = fs.readdirSync(`./bridge/events/${client.type.name}/`);
		files.forEach(file => {
			if (!file.endsWith('.js')) {
				const subfiles = fs.readdirSync(`./bridge/events/${client.type.name}/${file}`).filter(subfile => subfile.endsWith('.js'));
				subfiles.forEach(subfile => {
					const event = require(`./events/${client.type.name}/${file}/${subfile}`);
					client.on(file, event.bind(null, discord, guilded, config));
					delete require.cache[require.resolve(`./events/${client.type.name}/${file}/${subfile}`)];
					count++;
				});
				return;
			}
			const event = require(`./events/${client.type.name}/${file}`);
			const eventName = file.split('.')[0];
			client.on(eventName, event.bind(null, discord, guilded, config));
			delete require.cache[require.resolve(`./events/${client.type.name}/${file}`)];
			count++;
		});
		client.logger.info(`${count} event listeners loaded`);
	});
};