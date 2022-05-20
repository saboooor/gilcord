module.exports = {
	name: 'doc_edit',
	async execute(discord, guilded, interaction, doc) {
		try {
			// Get the text field value and update the item
			const title = interaction.fields.getTextInputValue('title');
			const content = interaction.fields.getTextInputValue('content');
			guilded.docs.update(doc.channelId, doc.id, { title, content });
		}
		catch (err) { discord.logger.error(err); }
	},
};