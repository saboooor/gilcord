module.exports = {
	name: 'list_note',
	async execute(discord, guilded, interaction, item) {
		try {
			// Get the text field value and update the item
			const note = interaction.fields.getTextInputValue('note');
			const message = interaction.fields.getTextInputValue('content');
			guilded.lists.update(item.channelId, item.id, { message, note: { content: note ?? ' ' } });
		}
		catch (err) { discord.logger.error(err); }
	},
};