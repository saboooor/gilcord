const fs = require('fs');
module.exports = client => {
	const files = fs.readdirSync(`./events/${client.type.name}/`);
	let count = 0;
	files.forEach(file => {
		if (!file.endsWith('.js')) return;
		const event = require(`../events/${client.type.name}/${file}`);
		const eventName = file.split('.')[0];
		client.on(eventName, event.bind(null, client));
		delete require.cache[require.resolve(`../events/${client.type.name}/${file}`)];
		count++;
	});
	client.logger.info(`${count} event listeners loaded`);
};