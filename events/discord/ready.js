module.exports = async (client) => {
	client.logger.info('Bot started!');
	const timer = (Date.now() - client.startTimestamp) / 1000;
	client.logger.info(`Done (${timer}s)! I am running!`);
};