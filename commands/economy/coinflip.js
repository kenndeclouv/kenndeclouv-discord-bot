const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const User = require("../../database/models/User");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("coinflip")
    .setDescription("Flip koin dan coba keberuntungan kamu.")
    .addIntegerOption((option) => option.setName("bet").setDescription("Jumlah untuk bertaruh").setRequired(true))
    .addStringOption((option) => option.setName("side").setDescription("Heads atau Tails").setRequired(true).addChoices({ name: "Heads", value: "heads" }, { name: "Tails", value: "tails" })),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    try {
      const bet = interaction.options.getInteger("bet");
      const side = interaction.options.getString("side").toLowerCase();
      const user = await User.findOne({
        where: { userId: interaction.user.id },
      });

      if (!user || user.cash < bet) {
        return interaction.reply({ content: "kamu tidak memiliki uang tunai yang cukup untuk bertaruh.", ephemeral: true });
      }

      const flip = Math.random() < 0.5 ? "heads" : "tails";

      if (side === flip) {
        user.cash += bet; // Double the bet if correct
        await user.save();
        const embed = new EmbedBuilder().setColor("Green").setTitle("> Hasil Coin Flip").setThumbnail(interaction.user.displayAvatarURL()).setDescription(`🎉 | **${flip}**! kamu menang dan mendapatkan **${bet} uang**!`).setTimestamp().setFooter({ text: `Sistem`, iconURL: interaction.client.user.displayAvatarURL() });
        return interaction.editReply({ embeds: [embed] });
      } else {
        user.cash -= bet; // Lose the bet if incorrect
        await user.save();
        const embed = new EmbedBuilder().setColor("Red").setTitle("> Hasil Coin Flip").setThumbnail(interaction.user.displayAvatarURL()).setDescription(`❌ | **${flip}**! kamu kehilangan **${bet} uang**.`).setTimestamp().setFooter({ text: `Sistem`, iconURL: interaction.client.user.displayAvatarURL() });
        return interaction.editReply({ embeds: [embed] });
      }
    } catch (error) {
      console.error("Error during coinflip command execution:", error);
      return interaction.editReply({ content: "❌ Terjadi kesalahan saat menjalankan perintah ini. Silakan coba lagi." });
    }
  },
};
