const { createLogger, format, transports } = require('winston');
const rn = new Date();
const logDate = `${minTwoDigits(rn.getMonth() + 1)}-${minTwoDigits(rn.getDate())}-${rn.getFullYear()}`;
function minTwoDigits(n) { return (n < 10 ? '0' : '') + n; }
module.exports = client => {
	// Create a logger
	client.logger = createLogger({
		format: format.combine(
			format.errors({ stack: true }),
			format.colorize(),
			format.timestamp(),
			format.printf(log => `[${new Date(log.timestamp).toLocaleString('default', { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true })} ${client.type.color}${client.type.name} ${log.level}]: ${log.message}${log.stack ? `\n${log.stack}` : ''}`),
		),
		transports: [
			new transports.Console(),
			new transports.File({ filename: `logs/${logDate}.log` }),
		],
		rejectionHandlers: [
			new transports.Console(),
			new transports.File({ filename: `logs/${logDate}.log` }),
		],
	});
	client.logger.info('Logger started');

	// Register events for disconnect, reconnect, warn, and error
	client.on('disconnect', () => client.logger.info('Bot is disconnecting...'));
	client.on('reconnecting', () => client.logger.info('Bot reconnecting...'));
	client.on('warn', error => client.logger.warn(error));
	client.on('error', error => client.logger.error(error));
};