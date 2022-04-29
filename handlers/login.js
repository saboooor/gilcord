const { disctoken } = require('../config.json');
module.exports = async client => {
	await client.login(disctoken);
	client.logger.info('Bot logged in');
};