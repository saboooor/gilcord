module.exports = (discord, guilded, srvs, message) => {
    if (message.channelId != guildedId || message.createdById == guilded.user.id || (!message.content && !message.raw.embeds)) return;
    message.member = guilded.members.cache.get(`${message.serverId}:${message.createdById}`);
    if (!message.member) message.member = await guilded.members.fetch(message.serverId, message.createdById);
    await discwh.edit({ channel: discordId });
    const discordmsg = await discwhclient.send({
        content: message.content,
        username: `Guilded • ${message.member.user.name}`,
        avatarURL: message.member.user.avatar,
        embeds: message.raw.embeds,
    });
    const updatefunc = async newmsg => {
        if (newmsg.id != message.id) return;
        discwh.editMessage(discordmsg.id, {
            content: newmsg.content,
            embeds: newmsg.embeds,
        });
    };
    guilded.on('messageUpdated', updatefunc);
    await sleep(15000);
    discord.removeListener('messageUpdate', updatefunc);
}