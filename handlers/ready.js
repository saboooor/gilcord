module.exports = (client) => {
	client.on('ready', async () => {
		client.logger.info('Bot started!');
		const timer = (Date.now() - client.startTimestamp) / 1000;
		client.logger.info(`Done (${timer}s)! I am running!`);
	});
};