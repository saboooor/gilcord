// Parse the config
const fs = require('fs');
const YAML = require('yaml');
global.config = YAML.parse(fs.readFileSync('./config.yml', 'utf8'));

if (!config.version || config.version != 1) {
	console.log('\u001b[31m!! Your config is a lower version than the current one at config.example.yml! please update your config !!\u001b[37m');
	if (!config.version) console.log('\u001b[33mIt also appears that your version of the config is of before the data rewrite.\nPlease note that updating your config will trigger the first-time list/docs sync once again\nTo avoid duplication after updating your config:\n- delete docs created by the bot on both ends\n- delete all list items on the discord side\u001b[37m');
	return;
}

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
		for (const handler of fs.readdirSync('./handlers').filter(file => file.endsWith('.js'))) require(`./handlers/${handler}`)(client, config);
	}

	// Load the bridge
	require('./bridge/load.js')(discord, guilded);
})();