require("dotenv").config();
module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    console.log(`✅ Bot siap sebagai ${client.user.tag}`);

    const guild = client.guilds.cache.first(); // ganti kalo banyak guild
    if (!guild) return;

    const updateMemberCounters = async () => {
      await guild.members.fetch(); // pastiin semua member ke-cache

      const totalMembers = guild.memberCount;
      const onlineMembers = guild.members.cache.filter(
        (m) =>
          m.presence && ["online", "idle", "dnd"].includes(m.presence.status)
      ).size;

      const memberChannel = guild.channels.cache.get(
        process.env.MEMBER_COUNT_CHANNEL_ID
      );
      const onlineChannel = guild.channels.cache.get(
        process.env.ONLINE_COUNT_CHANNEL_ID
      );

      if (memberChannel) await memberChannel.setName(`${totalMembers} MEMBERS`);
      if (onlineChannel) await onlineChannel.setName(`${onlineMembers} ONLINE`);
    };

    // update langsung saat ready
    if (process.env.SERVER_STATS_ON == "true") {
      await updateMemberCounters();
      setInterval(updateMemberCounters, 300000);
    }
    console.log(`✅ ${client.user.tag} terhubung!`);
    client.user.setPresence({
      activities: [{ name: process.env.DISCORD_BOT_ACTIVITY }],
      status: process.env.DISCORD_BOT_STATUS,
    });
  },
};
