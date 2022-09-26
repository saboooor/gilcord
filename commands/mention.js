const { SlashCommandStringOption } = require('discord.js');
const { Embed } = require('guilded.js');
module.exports = {
	name: 'mention',
	description: 'Mentions a user on the Guilded Server',
	options(cmd) {
		cmd.addStringOption(
			new SlashCommandStringOption()
				.setName('user')
				.setDescription('The Guilded user to mention')
				.setRequired(true)
				.setAutocomplete(true),
		);
	},
	async autoComplete(discord, guilded, interaction, srv) {
		// Get the channel config and check if it exists
		const bridge = srv.channels.find(b => b.discord.channelId == interaction.channel.id);
		if (!bridge) return interaction.respond([{ name: 'This channel isn\'t bridged to the Guilded server!', value: '0' }]);

		// Get the focused option
		const focusedValue = interaction.options.getFocused();

		// Get the members in the guilded server
		const members = await guilded.members.fetchMany(srv.guilded.serverId);

		// Generate the choices by name and id
		const choices = members.map(m => { return { name: m.user.name, value: m.user.id }; });

		// Filter the choices by the search query
		const filtered = choices.filter(choice => choice.name.toLowerCase().startsWith(focusedValue.toLowerCase()));

		// If the amount of choices is 25, truncate with __ more results
		if (filtered.length > 25) {
			const more = filtered.length - 24;
			filtered.length = 24;
			filtered.push({ name: `${more} more results, please type a more specific query.`, value: '0' });
		}

		// Show the choices
		interaction.respond(filtered);
	},
	async execute(discord, guilded, interaction, srv) {
		try {
			// Get the channel config and check if it exists
			const bridge = srv.channels.find(b => b.discord.channelId == interaction.channel.id);
			if (!bridge) return interaction.reply({ content: 'This channel isn\'t bridged to the Guilded server!', ephemeral: true });

			// Get the id and create mention embed
			const Id = interaction.options._hoistedOptions[0].value;
			const member = await guilded.members.fetch(srv.guilded.serverId, Id).catch(() => {
				discord.logger.warn(`Could not find user to mention: ${Id}`);
				return null;
			});
			if (!member) return interaction.reply({ content: 'That\'s not a user!', ephemeral: true });
			const mentionEmbed = new Embed()
				.setAuthor(interaction.member.user.tag, interaction.member.user.avatarURL())
				.setTitle('Mentioned you!')
				.setDescription(`<@${Id}>`);

			// Send the message	to the guilded server
			await guilded.messages.send(bridge.guilded.channelId, { embeds: [mentionEmbed] });
			await interaction.reply({ content: `Mentioned ${member.user.name}!` });
		}
		catch (err) { discord.logger.error(err); }
	},
};