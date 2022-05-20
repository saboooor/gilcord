module.exports = {
	name: 'list_toggle',
	async execute(discord, guilded, interaction, item) {
		try {
			// Defer the button and toggle the item completion state
			await interaction.deferUpdate();
			guilded.lists[item.completedAt ? 'uncomplete' : 'complete'](item.channelId, item.id);
		}
		catch (err) { discord.logger.error(err); }
	},
};