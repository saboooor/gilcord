module.exports = {
	name: 'list_toggle',
	async execute(discord, guilded, interaction, item) {
		try {
			// Toggle the item completion state and defer the button
			await guilded.lists[item.completedAt ? 'uncomplete' : 'complete'](item.channelId, item.id);
			await interaction.deferUpdate();
		}
		catch (err) { discord.logger.error(err); }
	},
};