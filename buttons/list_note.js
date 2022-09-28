const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
	name: 'list_note',
	async execute(discord, guilded, interaction, item) {
		try {
			// Create a text fields with the title and note
			const titleinput = new TextInputBuilder()
				.setCustomId('content')
				.setLabel('Set the content')
				.setStyle(TextInputStyle.Short)
				.setValue(item.message);
			const noteinput = new TextInputBuilder()
				.setCustomId('note')
				.setLabel('Set the note')
				.setStyle(TextInputStyle.Paragraph)
				.setRequired(false);
			if (item.note && item.note.content) noteinput.setValue(item.note.content);

			// Create and show a modal for the user to edit the list item
			const modal = new ModalBuilder()
				.setTitle('Edit this list item')
				.setCustomId(`list_note_${item.id}`)
				.addComponents([
					new ActionRowBuilder().addComponents([ titleinput ]),
					new ActionRowBuilder().addComponents([ noteinput ]),
				]);
			interaction.showModal(modal);
		}
		catch (err) { discord.logger.error(err); }
	},
};