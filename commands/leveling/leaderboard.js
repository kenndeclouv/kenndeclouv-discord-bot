const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const User = require("../../database/models/User");

module.exports = {
  data: new SlashCommandBuilder().setName("leaderboard").setDescription("Lihat papan peringkat level."),
  async execute(interaction) {
    const topUsers = await User.findAll({
      order: [["level", "DESC"], ["xp", "DESC"]],
      limit: 10,
    });

    const leaderboard = topUsers.map((user, index) => `${index + 1}. <@${user.userId}> - Level **${user.level}** (${user.xp} XP)`).join("\n");

    const embed = new EmbedBuilder()
      .setColor("Gold")
      .setTitle("> Papan Peringkat Level")
      .setDescription(leaderboard || "Belum ada data.")
      .setThumbnail(interaction.guild.iconURL())
      .setTimestamp()
      .setFooter({
        text: `Sistem Leveling`,
        iconURL: interaction.guild.iconURL(),
      });

    await interaction.reply({ embeds: [embed] });
  },
};
