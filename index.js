// Parse the config
const fs = require('fs');
const YAML = require('yaml');
const config = YAML.parse(fs.readFileSync('./config.yml', 'utf8'));

// Get libraries
const D = require('discord.js');
const G = require('guilded.js');

// Load the discord client
const discord = new D.Client({
	partials: [
		D.Partials.Message,
		D.Partials.Channel,
		D.Partials.User,
	],
	intents: [
		D.GatewayIntentBits.Guilds,
		D.GatewayIntentBits.GuildMessages,
		D.GatewayIntentBits.GuildMembers,
		D.GatewayIntentBits.MessageContent,
	],
});
discord.type = { color: '\u001b[34m', name: 'discord' };

// Load the guilded client
const guilded = new G.Client({ token: config.guilded.token });
guilded.type = { color: '\u001b[33m', name: 'guilded' };

// Asynchronize
(async () => {
	// Log the bots in and load the handlers
	for (const client of [discord, guilded]) {
		client.startTimestamp = Date.now();
		await client.login(config.discord.token);
		for (const handler of fs.readdirSync('./handlers').filter(file => file.endsWith('.js'))) require(`./handlers/${handler}`)(client);
	}

	// Load the bridge
	require('./bridge/load.js')(discord, guilded, config);
})();