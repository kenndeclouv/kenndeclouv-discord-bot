const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const checkPermission = require("../../helpers/checkPermission");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Menghapus pesan dari channel.")
    .addIntegerOption((option) => option.setName("amount").setDescription("Jumlah pesan untuk dihapus").setRequired(true)),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    if (!checkPermission(interaction.member)) {
      return interaction.editReply({ content: "❌ Kamu tidak punya izin untuk menggunakan perintah ini." });
    }
    const amount = interaction.options.getInteger("amount");

    if (!interaction.member.permissions.has("MANAGE_MESSAGES")) {
      return interaction.editReply({ content: "Kamu tidak memiliki izin untuk menghapus pesan." });
    }

    await interaction.channel.bulkDelete(amount, true);
    const embed = new EmbedBuilder()
      .setColor("Green")
      .setTitle("> Clear")
      .setDescription(`**${amount}** pesan telah dihapus dari channel ini.`)
      .setThumbnail(interaction.client.user.displayAvatarURL())
      .setTimestamp()
      .setFooter({
        text: `Sistem`,
        iconURL: interaction.client.user.displayAvatarURL(),
      });
    return interaction.editReply({ embeds: [embed] });
  },
};
