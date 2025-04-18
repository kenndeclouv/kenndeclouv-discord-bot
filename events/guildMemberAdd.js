require("dotenv").config();
const { EmbedBuilder, Events } = require("discord.js");
module.exports = {
  name: Events.GuildMemberAdd,
  execute(member, client) {
    console.log("welcomer in connected");
    const channel = member.guild.channels.cache.get(process.env.WELCOME_IN_CHANNEL_ID);
    if (!channel) return console.log("Welcome channel not found");

    const welcomeEmbed = new EmbedBuilder()
      .setColor("#f7f7f7")
      .setTitle(`> Halooo ${member.user.displayName}!`)
      .setDescription(`Wihhh ${member.user.displayName} gabung ke server kitaa! semoga betah di server kitaa yakk!`)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setFooter({
        text: `Sistem ${member.guild.name}`,
        iconURL: client.user.displayAvatarURL({ dynamic: true }),
      });

    if (process.env.WELCOME_IN_ON === "true") {
      channel.send({ embeds: [welcomeEmbed] });
    }
  },
};
