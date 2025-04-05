const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const User = require("../../database/models/User");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("withdraw")
    .setDescription("Tarik uang tunai kamu dari bank.")
    .addIntegerOption((option) => option.setName("amount").setDescription("Jumlah untuk menarik uang").setRequired(true)),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    try {
      const amount = interaction.options.getInteger("amount");
      const user = await User.findOne({
        where: { userId: interaction.user.id },
      });

      if (!user || user.bank < amount) {
        return interaction.editReply({ content: "kamu tidak memiliki uang yang cukup di bank untuk menarik uang!" });
      }

      user.bank -= amount;
      user.cash += amount;
      await user.save();

      const embed = new EmbedBuilder().setColor("Green").setTitle("> Hasil Menarik Uang").setThumbnail(interaction.user.displayAvatarURL()).setDescription(`${interaction.user.username} menarik **${amount} uang** dari bank.`).setTimestamp().setFooter({ text: `Sistem`, iconURL: interaction.client.user.displayAvatarURL() });
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error("Error during withdraw command execution:", error);
      return interaction.editReply({ content: "❌ | Terjadi kesalahan saat menjalankan perintah ini. Silakan coba lagi." });
    }
  },
};
