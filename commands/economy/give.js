const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const User = require("../../database/models/User");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("give")
    .setDescription("Berikan uang kepada pengguna lain.")
    .addUserOption((option) => option.setName("target").setDescription("Pengguna untuk memberikan uang").setRequired(true))
    .addIntegerOption((option) => option.setName("amount").setDescription("Jumlah uang untuk memberikan").setRequired(true)),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    try {
      const target = interaction.options.getUser("target");
      const amount = interaction.options.getInteger("amount");

      const giver = await User.findOne({
        where: { userId: interaction.user.id },
      });
      const receiver = await User.findOne({
        where: { userId: target.id },
      });

      if (!giver || giver.cash < amount) {
        return interaction.reply({ content: "kamu tidak memiliki uang tunai yang cukup untuk memberikan.", ephemeral: true });
      }

      // Update balances
      giver.cash -= amount;
      receiver.cash += amount;

      await giver.save();
      await receiver.save();

      const embed = new EmbedBuilder().setColor("Green").setTitle("> Hasil Memberikan Uang").setThumbnail(interaction.user.displayAvatarURL()).setDescription(`kamu memberikan **${amount} uang** ke **${target.username}**!`).setTimestamp().setFooter({ text: `Sistem`, iconURL: interaction.client.user.displayAvatarURL() });
      return interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error("Error during give command execution:", error);
      return interaction.editReply({ content: "❌ Terjadi kesalahan saat menjalankan perintah ini. Silakan coba lagi." });
    }
  },
};
