const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const checkPermission = require("../../helpers/checkPermission");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("unlock")
    .setDescription("Unlocks a channel to allow messages.")
    .addChannelOption((option) => option.setName("channel").setDescription("Channel to unlock").setRequired(false)),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    if (!checkPermission(interaction.member)) {
      return interaction.editReply({ content: "❌ Kamu tidak punya izin untuk menggunakan perintah ini." });
    }
    const channel = interaction.options.getChannel("channel") || interaction.channel;

    if (!interaction.member.permissions.has("MANAGE_CHANNELS")) {
      return interaction.editReply({ content: "Kamu tidak memiliki izin untuk membuka channel." });
    }

    await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SEND_MESSAGES: true });
    const embed = new EmbedBuilder()
      .setColor("Green")
      .setTitle(`> Unlock channel`)
      .setDescription(`Channel **${channel.name}** telah dibuka.`)
      .setThumbnail(interaction.client.user.displayAvatarURL())
      .setTimestamp()
      .setFooter({ text: `Sistem`, iconURL: interaction.client.user.displayAvatarURL() });
    return interaction.editReply({ embeds: [embed] });
  },
};
