const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
module.exports = {
	name: 'doc_edit',
	async execute(discord, guilded, interaction, doc) {
		try {
			// Create a text fields with the title and note
			const titleinput = new TextInputBuilder()
				.setCustomId('title')
				.setLabel('Set the title')
				.setStyle(TextInputStyle.Short)
				.setValue(doc.title);
			const noteinput = new TextInputBuilder()
				.setCustomId('content')
				.setLabel('Set the content')
				.setStyle(TextInputStyle.Paragraph)
				.setValue(doc.content);

			// Create and show a modal for the user to fill out the note
			const modal = new ModalBuilder()
				.setTitle('Edit this document')
				.setCustomId(`doc_edit_${doc.id}`)
				.addComponents([
					new ActionRowBuilder().addComponents([ titleinput ]),
					new ActionRowBuilder().addComponents([ noteinput ]),
				]);
			interaction.showModal(modal);
		}
		catch (err) { discord.logger.error(err); }
	},
};