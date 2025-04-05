const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const User = require("../../database/models/User");
require("dotenv").config();
const checkCooldown = require("../../helpers/checkCooldown");
const Inventory = require("../../database/models/inventory"); 

module.exports = {
  data: new SlashCommandBuilder().setName("work").setDescription("Bekerja untuk mendapatkan uang."),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    try {
      let user = await User.findOne({
        where: { userId: interaction.user.id },
      });
      if (!user) {
        return interaction.editReply({ content: "kamu belum memiliki akun gunakan `/account create` untuk membuat akun." });
      }

      const laptop = await Inventory.findOne({ where: { userId: user.userId, itemName: "💻 Laptop" } });

      let cooldownTime = 1;
      if (laptop) {
        cooldownTime = 0.5;
      }
      // Cooldown check
      const cooldown = checkCooldown(user.lastWork, process.env.WORK_COOLDOWN * cooldownTime);
      if (cooldown.remaining) {
        return interaction.editReply({ content: `🕒 | kamu dapat bekerja lagi dalam **${cooldown.time}**!` });
      }

      const randomCash = Math.floor((Math.random() * 101 + 50) * 0.5 * (user.careerMastered || 1));

      // Determine if the user has to pay tax
      const payTax = Math.random() < 0.05; // 5% chance
      let taxAmount = 0;
      if (payTax) {
        taxAmount = Math.floor(randomCash * 0.1); // 10% tax
        user.cash += randomCash - taxAmount;
      } else {
        user.cash += randomCash;
      }

      user.lastWork = new Date();
      const workedMaximally = Math.random() >= 0.8; // 20% chance of working maximally
      if (workedMaximally && user.careerMastered < 10) {
        user.careerMastered += 1;
      }
      await user.save();

      const embed = new EmbedBuilder()
        .setColor(payTax ? "Yellow" : "Green")
        .setTitle("> Hasil Bekerja")
        .setThumbnail(interaction.user.displayAvatarURL())
        .setDescription(`${interaction.user.username} bekerja keras dan mendapatkan **${randomCash} uang**!${payTax ? ` tapi harus membayar pajak sebesar **${taxAmount} uang**.` : ""}${workedMaximally ? ` dan level karir kamu naik **${user.careerMastered}**!` : ""}`)
        .setTimestamp()
        .setFooter({ text: `Sistem`, iconURL: interaction.client.user.displayAvatarURL() });
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error("Error during work command execution:", error);
      return interaction.editReply({ content: "❌ | Terjadi kesalahan saat menjalankan perintah ini. Silakan coba lagi." });
    }
  },
};
