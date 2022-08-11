const { createLogger, format, transports } = require('winston');
const rn = new Date();
const date = `${minTwoDigits(rn.getMonth() + 1)}-${minTwoDigits(rn.getDate())}-${rn.getFullYear()}`;
function minTwoDigits(n) { return (n < 10 ? '0' : '') + n; }
module.exports = client => {
	client.date = date;
	client.logger = createLogger({
		format: format.combine(
			format.errors({ stack: true }),
			format.colorize(),
			format.timestamp(),
			format.printf(log => `[${log.timestamp.split('T')[1].split('.')[0]} ${client.type.color}${client.type.name} ${log.level}]: ${log.message}${log.stack ? `\n${log.stack}` : ''}`),
		),
		transports: [
			new transports.Console(),
			new transports.File({ filename: `logs/${date}.log` }),
		],
		rejectionHandlers: [
			new transports.Console(),
			new transports.File({ filename: `logs/${date}.log` }),
		],
	});
	client.logger.info('Logger started');
	client.on('disconnect', () => client.logger.info('Bot is disconnecting...'));
	client.on('reconnecting', () => client.logger.info('Bot reconnecting...'));
	if (client.type.name == 'discord') client.rest.on('rateLimited', (info) => client.logger.warn(`Encountered ${info.method} rate limit!`));
	client.on('warn', error => client.logger.warn(error));
	client.on('error', error => client.logger.error(error));
};