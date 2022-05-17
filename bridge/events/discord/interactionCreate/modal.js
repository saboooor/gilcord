module.exports = async (discord, guilded, config, interaction) => {
	// Check if the interaction is a modal
	if (!interaction.isModalSubmit()) return;

	// Get the listId and button from the customId
	const split = interaction.customId.split('_');
	const listId = split.pop();
	const buttonId = split.join('_');

	// Get the button from the available buttons in the bot
	const button = discord.buttons.get(buttonId);
	if (!button) return;

	// Get the server config and check if it exists
	const srv = config.servers.find(s => s.discord.serverId == interaction.guild.id);
	if (!srv) return;

	// Get the channel config and check if it exists
	const listbridge = srv.lists.find(b => b.discord.channelId == interaction.channel.id);
	if (!listbridge) return;

	// Fetch the list item and check if it exists
	const item = await guilded.lists.fetch(listbridge.guilded.channelId, listId);
	if (!item) return;

	// Get the text field value and update the item
	const note = interaction.fields.getTextInputValue('note');
	const content = interaction.fields.getTextInputValue('content');
	guilded.lists.update(item.channelId, item.id, { message: content, note: { content: note ? note : '\u200b' } });
};