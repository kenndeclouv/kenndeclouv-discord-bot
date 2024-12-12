const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const User = require("../../database/models/User");
const config = require("../../config");
const checkCooldown = require("../../helpers/checkCooldown");

module.exports = {
  data: new SlashCommandBuilder().setName("daily").setDescription("Kumpulkan uang harian anda."),
  async execute(interaction) {
    let user = await User.findOne({
      where: { userId: interaction.user.id },
    });
    if (!user) {
      return interaction.reply({ content: 'kamu belum memiliki akun gunakan `/account create` untuk membuat akun.', ephemeral: true });
    }

    // Cooldown check
    const cooldown = checkCooldown(user.lastDaily, config.cooldowns.daily);
    if (cooldown.remaining) {
      return interaction.reply({ content: `🕒 | kamu dapat mengumpulkan uang harian kamu dalam **${cooldown.time}**!`, ephemeral: true });
    }

    // Randomize the daily cash reward between 50 and 150
    const randomCash = Math.floor(Math.random() * 101) + 50;
    user.cash += randomCash;
    user.lastDaily = Date.now();
    await user.save();

    const embed = new EmbedBuilder()
      .setColor("Green")
      .setTitle("> Hasil Mengumpulkan Uang Harian")
      .setThumbnail(interaction.user.displayAvatarURL())
      .setDescription(`kamu mengumpulkan uang harian kamu sebesar **${randomCash} uang**!`)
      .setTimestamp()
      .setFooter({ text: `Diminta oleh ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });
    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
