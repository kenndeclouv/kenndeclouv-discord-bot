const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const User = require("../../database/models/User");
const config = require("../../config");
const checkCooldown = require("../../helpers/checkCooldown");

module.exports = {
  data: new SlashCommandBuilder().setName("work").setDescription("Bekerja untuk mendapatkan uang."),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    let user = await User.findOne({
      where: { userId: interaction.user.id },
    });
    if (!user) {
      return interaction.editReply({ content: "kamu belum memiliki akun gunakan `/account create` untuk membuat akun." });
    }

    // Cooldown check
    const cooldown = checkCooldown(user.lastWork, config.cooldowns.work);
    if (cooldown.remaining) {
      return interaction.editReply({ content: `🕒 | kamu dapat bekerja lagi dalam **${cooldown.time}**!` });
    }

    const randomCash = Math.floor((Math.random() * 101 + 50) * 0.5 * (user.careerMastered || 1));
    
    // Determine if the user has to pay tax
    const payTax = Math.random() < 0.05; // 5% chance
    let taxAmount = 0;
    if (payTax) {
      taxAmount = Math.floor(randomCash * 0.1); // 10% tax
      user.cash += (randomCash - taxAmount);
    } else {
      user.cash += randomCash;
    }

    user.lastWork = new Date();
    const workedMaximally = Math.random() >= 0.80; // 20% chance of working maximally
    if (workedMaximally && user.careerMastered < 10) {
      user.careerMastered += 1;
    }
    await user.save();

    const embed = new EmbedBuilder()
      .setColor(payTax ? "Yellow" : "Green")
      .setTitle("> Hasil Bekerja")
      .setThumbnail(interaction.user.displayAvatarURL())
      .setDescription(`${interaction.user.username} bekerja keras dan mendapatkan **${randomCash} uang**!${payTax ? ` tapi harus membayar pajak sebesar **${taxAmount} uang**.` : ''}${workedMaximally ? ` dan level karir anda naik **${user.careerMastered}**!` : ''}`)
      .setTimestamp()
      .setFooter({ text: `Sistem`, iconURL: interaction.client.user.displayAvatarURL() });
    await interaction.editReply({ embeds: [embed] });
  },
};
