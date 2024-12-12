const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const User = require("../../database/models/User");
const { levelUpXp } = require("../../system/leveling");

module.exports = {
  data: new SlashCommandBuilder().setName("level").setDescription("Lihat profil level anda."),
  async execute(interaction) {
    try {
      // Mencari data user berdasarkan ID
      const user = await User.findOne({ where: { userId: interaction.user.id } });

      // Jika tidak ada data user, beri tahu bahwa profil belum ada
      if (!user) {
        return interaction.reply({
          content: "kamu belum memiliki profil level.",
          ephemeral: true,
        });
      }

      // Membuat embed untuk menampilkan profil level
      const embed = new EmbedBuilder()
        .setColor("Blue")
        .setTitle("> Profil Level")
        .setDescription(`**${interaction.user.username}**, kamu berada di level **${user.level || 0}** dengan total XP **${user.xp || 0}**, **xp saat ini:** ${user.xp}/${levelUpXp(user.level)}.`)
        .setThumbnail(interaction.user.displayAvatarURL())
        .setTimestamp()
        .setFooter({
          text: `Diminta oleh ${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL(),
        });

      // Mengirimkan embed sebagai balasan
      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      console.error("Error executing profile command:", error);
      interaction.reply({
        content: "Terjadi kesalahan saat mencoba mengambil profil level.",
        ephemeral: true,
      });
    }
  },
};
