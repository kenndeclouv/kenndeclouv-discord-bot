const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const User = require("../../database/models/User");

module.exports = {
  data: new SlashCommandBuilder().setName("cash").setDescription("Cek saldo tunai kamu."),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    try {
      const user = await User.findOne({
        where: { userId: interaction.user.id },
      });
      if (!user) {
        return interaction.reply({ content: "kamu belum memiliki saldo.", ephemeral: true });
      }

      const embed = new EmbedBuilder().setColor("Green").setTitle("> Saldo Tunai").setThumbnail(interaction.user.displayAvatarURL()).setDescription(`**${interaction.user.username}**, kamu memiliki **${user.cash} uang tunai!**`).setTimestamp().setFooter({ text: `Sistem`, iconURL: interaction.client.user.displayAvatarURL() });
      return interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error("Error during cash command execution:", error);
      return interaction.editReply({ content: "❌ Terjadi kesalahan saat menjalankan perintah ini. Silakan coba lagi." });
    }
  },
};
