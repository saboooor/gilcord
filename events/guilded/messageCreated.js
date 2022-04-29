const { UserType } = require('guilded.js');
const { prefix } = require('../../config.json');
module.exports = async (client, message) => {
	// Check if message is from a bot and if so return, and fetch member if not already fetched
	if (message.createdByBotId || message.createdByWebhookId) return;
	message.member = client.members.cache.get(`${message.serverId}:${message.createdById}`);
	if (!message.member) message.member = await client.members.fetch(message.serverId, message.createdById);
	if (message.member.user.type == UserType.Bot) return;

	// Get args by splitting the message by the spaces and getting rid of the prefix
	const args = message.content.slice(prefix.length).trim().split(/ +/);

	// Get the command name from the fist arg and get rid of the first arg
	const commandName = args.shift().toLowerCase();

	// Get the command from the commandName, if it doesn't exist, return
	const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
	if (!command || !command.name) return;

	// execute the command
	try {
		client.logger.info(`${message.member.user.name} issued command: ${message.content}`);
		command.execute(message, args, client);
	}
	catch (err) { client.logger.error(err.stack); }

};