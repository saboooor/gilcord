const fs = require('fs');
const { Collection } = require('discord.js');

module.exports = client => {
	let count = 0;
	client.modals = new Collection();
	const modalFiles = fs.readdirSync('./modals').filter(file => file.endsWith('.js'));
	for (const file of modalFiles) {
		const modal = require(`../modals/${file}`);
		client.modals.set(modal.name, modal);
		count++;
	}
	client.logger.info(`${count} modals loaded`);
};