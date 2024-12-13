require("dotenv").config();
const { EmbedBuilder, Events } = require("discord.js");
module.exports = {
  name: Events.GuildMemberRemove,
  execute(member, client) {
    console.log("welcomer out connected");
    const channel = member.guild.channels.cache.get(process.env.WELCOME_OUT_CHANNEL_ID);
    if (!channel) return console.log("Welcome channel not found");

    const welcomeEmbed = new EmbedBuilder()
      .setColor("#f7f7f7")
      .setTitle(`> Huhuuu ${member.user.displayName} keluarr 😭`)
      .setDescription(`${member.user.displayName} kami selalu merindukanmuu 😭`)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setFooter({
        text: `Sistem ${member.guild.name}`,
        iconURL: client.user.displayAvatarURL({ dynamic: true }),
      });

    if (process.env.WELCOME_OUT_ON === "true") {
      channel.send({ embeds: [welcomeEmbed] });
    }
  },
};
