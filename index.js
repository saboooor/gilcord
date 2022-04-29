const fs = require('fs');

const D = require('discord.js');
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
	allowedMentions: {
		repliedUser: false,
	},
});
discord.type = { color: '\u001b[34m', name: 'discord' };
discord.startTimestamp = Date.now();
for (const handler of fs.readdirSync('./handlers').filter(file => file.endsWith('.js'))) require(`./handlers/${handler}`)(discord);

const { guilded: { token } } = require('./config.json');
const G = require('guilded.js');
const guilded = new G.Client({ token: token });
guilded.type = { color: '\u001b[33m', name: 'guilded' };
guilded.startTimestamp = Date.now();
for (const handler of fs.readdirSync('./handlers').filter(file => file.endsWith('.js'))) require(`./handlers/${handler}`)(guilded);

require('./bridgehandler.js')(discord, guilded);