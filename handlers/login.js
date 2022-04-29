const { discord: { token } } = require('../config.json');
module.exports = async client => {
	await client.login(token);
	client.logger.info('Bot logged in');
};