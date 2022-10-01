const fs = require('fs');

module.exports = async (discord, guilded, discserver, srv) => {
	// Check if the docs bridge on the server exists
	if (!srv.docs) return;

	// Define the server's docs channel data path
	const dataPath = `./data/${srv.guilded.serverId}/docs`;

	// Create messages folder in data if it doesn't exist
	if (!fs.existsSync(dataPath)) fs.mkdirSync(dataPath, { recursive: true });

	// Iterate through every docs bridge that's defined
	for (const bridge of srv.docs) {
		// If the json doesnt exist create it
		if (!fs.existsSync(`${dataPath}/${bridge.guilded.channelId}.json`)) fs.writeFileSync(`${dataPath}/${bridge.guilded.channelId}.json`, '[]');

		// Get the Guilded channel and check if it exists
		const guilchannel = await guilded.channels.fetch(bridge.guilded.channelId).catch(() => { return null; });
		if (!guilchannel) {
			discord.logger.error(`${discserver.name}'s Guilded channelId ${bridge.guilded.channelId} doesn't exist!`);
			continue;
		}

		// Get the Discord channel and check if it exists
		const discchannel = await discserver.channels.fetch(bridge.discord.channelId).catch(() => { return null; });
		if (!discchannel) {
			discord.logger.error(`${discserver.name}'s Discord channelId ${bridge.discord.channelId} doesn't exist!`);
			continue;
		}

		// Get all docs in the guilded channel
		const docs = await guilchannel.getDocs();

		// Iterate through the docs
		for (const doc of docs) {
			// Load the json file
			const json = require(`../../${dataPath}/${bridge.guilded.channelId}.json`);

			// Check if the doc already exists in the json and skip if so
			if (json.find(cachedDoc => cachedDoc.id == doc.id)) continue;

			// Split the doc content every 2000 characters
			const docContent = doc.content.match(/.{1,2000}/g);

			// Create the thread with the doc
			const thread = await discchannel.threads.create({
				name: doc.title,
				message: { content: docContent.shift() },
			});

			// Send the remaining chunks if available
			if (docContent.length) discord.logger.warn('Sending multiple messages to discord since the doc is over 2000 characters, please use with care as this is still an unstable feature!');
			for (const content of docContent) await thread.send({ content });

			// Push the doc in the json file
			json.push({
				id: doc.id,
				threadId: thread.id,
			});

			// Write the new data into the json file
			fs.writeFileSync(`${dataPath}/${bridge.guilded.channelId}.json`, JSON.stringify(json));
		}

		// Get all threads in the discord channel
		const threads = (await discchannel.threads.fetchActive()).threads;

		// Iterate through the threads
		for (const threadData of threads) {
			// Load the json file
			const json = require(`../../${dataPath}/${bridge.guilded.channelId}.json`);

			// Get the thread from the data
			const thread = threadData[1];

			// Check if the doc already exists in the json and skip if so
			if (json.find(cachedDoc => cachedDoc.threadId == thread.id)) continue;

			// Get the starter message for the content
			const starterMessage = await thread.fetchStarterMessage();

			// Create the doc in the guilded channel
			const doc = await guilded.docs.create(bridge.guilded.channelId, { title: thread.name, content: starterMessage.content });

			// Push the doc in the json file
			json.push({
				id: doc.id,
				threadId: thread.id,
			});

			// Write the new data into the json file
			fs.writeFileSync(`${dataPath}/${bridge.guilded.channelId}.json`, JSON.stringify(json));
		}
	}

	// Log
	discord.logger.info(`${discserver.name}'s docs channel bridges have been loaded!`);
};