const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const User = require("../../database/models/User");
const { levelUpXp } = require("../../system/leveling");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("level")
    .setDescription("info leveling di server ini.")
    .addSubcommand((subcommand) => subcommand.setName("profile").setDescription("Lihat profil level anda."))
    .addSubcommand((subcommand) => subcommand.setName("leaderboard").setDescription("Lihat papan peringkat level.")),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "profile") {
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
    } else if (subcommand === "leaderboard") {
      const topUsers = await User.findAll({
        order: [
          ["level", "DESC"],
          ["xp", "DESC"],
        ],
        limit: 3,
      });

      const leaderboard = topUsers.map((user, index) => `${index + 1}. <@${user.userId}> - Level **${user.level || 0}** (${user.xp || 0} XP)`).join("\n");

      const embed = new EmbedBuilder()
        .setColor("Gold")
        .setTitle("> Papan Peringkat Level top 3")
        .setDescription(leaderboard || "Belum ada data.")
        .setThumbnail(interaction.client.user.displayAvatarURL())
        .setTimestamp()
        .setFooter({
          text: `Sistem Leveling`,
          iconURL: interaction.client.user.displayAvatarURL(),
        });

      await interaction.reply({ embeds: [embed] });
    }
  },
};
