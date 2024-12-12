require("dotenv").config();
const { EmbedBuilder, Events } = require("discord.js");
module.exports = {
  name: Events.GuildMemberAdd,
  execute(member) {
    console.log("welcomer connected");
    const channel = member.guild.channels.cache.get(process.env.WELCOME_CHANNEL_ID);
    if (!channel) return console.log("Welcome channel not found");

    const welcomeEmbed = new EmbedBuilder()
      .setColor("#f7f7f7")
      .setTitle(`> ${process.env.WELCOME_TITLE}`)
      .setDescription(`${process.env.WELCOME_DESCRIPTION}`)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setFooter({
        text: process.env.WELCOME_FOOTER,
        iconURL: member.guild.iconURL({ dynamic: true }),
      });

    if (process.env.WELCOME_ON === "true") {
      channel.send({ embeds: [welcomeEmbed] });
    }
  },
};
