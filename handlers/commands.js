const fs = require('fs');
const { Collection } = require('discord.js');

module.exports = client => {
	let count = 0;
	client.commands = new Collection();
	const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const command = require(`../commands/${file}`);
		client.commands.set(command.name, command);
		count++;
	}
	client.logger.info(`${count} commands loaded`);
};