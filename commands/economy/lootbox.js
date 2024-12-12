const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const User = require("../../database/models/User");
const config = require("../../config");
const checkCooldown = require("../../helpers/checkCooldown");

module.exports = {
  data: new SlashCommandBuilder().setName("lootbox").setDescription("Buka kotak hadiah untuk mendapatkan hadiah acak."),
  async execute(interaction) {
    let user = await User.findOne({
      where: { userId: interaction.user.id },
    });
    if (!user) {
      return interaction.reply({ content: 'kamu belum memiliki akun gunakan `/account create` untuk membuat akun.', ephemeral: true });
    }

    // Cooldown check
    const cooldown = checkCooldown(user.lastLootbox, config.cooldowns.lootbox);
    if (cooldown.remaining) {
      return interaction.reply({ content: `🕒 | kamu dapat membuka kotak hadiah lainnya dalam **${cooldown.time}**!`, ephemeral: true });
    }

    // Randomize lootbox reward between 100 and 500
    const randomReward = Math.floor(Math.random() * 401) + 100;
    user.cash += randomReward;
    user.lastLootbox = Date.now();
    await user.save();

    const embed = new EmbedBuilder()
      .setColor("Green")
      .setTitle("> Hasil Membuka Kotak Hadiah")
      .setThumbnail(interaction.user.displayAvatarURL())
      .setDescription(`kamu membuka kotak hadiah dan menerima **${randomReward} uang**!`)
      .setTimestamp()
      .setFooter({ text: `Diminta oleh ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });
    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
