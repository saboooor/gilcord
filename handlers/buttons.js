const fs = require('fs');
const { Collection } = require('discord.js');
module.exports = client => {
	let count = 0;
	client.buttons = new Collection();
	const buttonFiles = fs.readdirSync('./buttons').filter(file => file.endsWith('.js'));
	for (const file of buttonFiles) {
		const button = require(`../buttons/${file}`);
		client.buttons.set(button.name, button);
		count++;
	}
	client.logger.info(`${count} buttons loaded`);
};