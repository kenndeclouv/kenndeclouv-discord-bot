const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const User = require("../../database/models/User");
const { levelUpXp } = require("../../system/leveling");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("level")
    .setDescription("Info leveling di server ini.")
    .addSubcommand((subcommand) => subcommand.setName("profile").setDescription("Lihat profil level Anda."))
    .addSubcommand((subcommand) => subcommand.setName("leaderboard").setDescription("Lihat papan peringkat level."))
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription("Tambahkan level ke pengguna.")
        .addUserOption((option) => option.setName("user").setDescription("Pengguna yang akan ditambahkan levelnya").setRequired(true))
        .addIntegerOption((option) => option.setName("level").setDescription("Level yang akan ditambahkan").setRequired(true))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("set")
        .setDescription("Set level ke pengguna.")
        .addUserOption((option) => option.setName("user").setDescription("Pengguna yang akan diset levelnya").setRequired(true))
        .addIntegerOption((option) => option.setName("level").setDescription("Level yang akan diset").setRequired(true))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("xp-add")
        .setDescription("Tambahkan XP ke pengguna.")
        .addUserOption((option) => option.setName("user").setDescription("Pengguna yang akan ditambahkan XPnya").setRequired(true))
        .addIntegerOption((option) => option.setName("xp").setDescription("XP yang akan ditambahkan").setRequired(true))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("xp-set")
        .setDescription("Set XP ke pengguna.")
        .addUserOption((option) => option.setName("user").setDescription("Pengguna yang akan diset XPnya").setRequired(true))
        .addIntegerOption((option) => option.setName("xp").setDescription("XP yang akan diset").setRequired(true))
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    try {
      const subcommand = interaction.options.getSubcommand();
      switch (subcommand) {
        case "profile": {
          // Mencari data user berdasarkan ID
          const user = await User.findOne({ where: { userId: interaction.user.id } });

          // Jika tidak ada data user, beri tahu bahwa profil belum ada
          if (!user) {
            return interaction.editReply({
              content: "Anda belum memiliki profil level.",
            });
          }

          // Membuat embed untuk menampilkan profil level
          const embed = new EmbedBuilder()
            .setColor("Blue")
            .setTitle("> Profil Level")
            .setDescription(`**${interaction.user.username}**, Anda berada di level **${user.level || 0}** dengan total XP **${user.xp || 0}**, **XP saat ini:** ${user.xp}/${levelUpXp(user.level)}.`)
            .setThumbnail(interaction.user.displayAvatarURL())
            .setTimestamp()
            .setFooter({
              text: `Diminta oleh ${interaction.user.username}`,
              iconURL: interaction.user.displayAvatarURL(),
            });

          // Mengirimkan embed sebagai balasan
          await interaction.editReply({ embeds: [embed] });

          break; // Added break statement
        }
        case "leaderboard": {
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
            .setTitle("> Papan Peringkat Level Top 3")
            .setDescription(leaderboard || "Belum ada data.")
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setTimestamp()
            .setFooter({
              text: `Sistem Leveling`,
              iconURL: interaction.client.user.displayAvatarURL(),
            });

          await interaction.editReply({ embeds: [embed] });
          break; // Added break statement
        }
        case "add": {
          const user = await User.findOne({ where: { userId: interaction.options.getUser("user").id } });
          if (!user) {
            return interaction.editReply({ content: "Pengguna tidak ditemukan." });
          }
          user.level += interaction.options.getInteger("level");
          await user.save();
          const embed = new EmbedBuilder()
            .setColor("Green")
            .setTitle("> Level Added")
            .setDescription(`Level berhasil ditambahkan ke pengguna **${interaction.options.getUser("user").username}** sebanyak **${interaction.options.getInteger("level")}** level, sekarang levelnya adalah **${user.level}** level.`)
            .setTimestamp()
            .setFooter({
              text: `sistem leveling`,
              iconURL: interaction.client.user.displayAvatarURL(),
            });

          return interaction.editReply({ embeds: [embed] });
        }
        case "set": {
          const user = await User.findOne({ where: { userId: interaction.options.getUser("user").id } });
          if (!user) {
            return interaction.editReply({ content: "Pengguna tidak ditemukan." });
          }
          user.level = interaction.options.getInteger("level");
          await user.save();
          const embed = new EmbedBuilder()
            .setColor("Green")
            .setTitle("> Level Set")
            .setDescription(`Level berhasil diatur ke pengguna **${interaction.options.getUser("user").username}** sekarang levelnya adalah **${user.level}** level.`)
            .setTimestamp()
            .setFooter({
              text: `sistem leveling`,
              iconURL: interaction.client.user.displayAvatarURL(),
            });

          return interaction.editReply({ embeds: [embed] });
        }
        case "xp-add": {
          const user = await User.findOne({ where: { userId: interaction.options.getUser("user").id } });
          if (!user) {
            return interaction.editReply({ content: "Pengguna tidak ditemukan." });
          }
          user.xp += interaction.options.getInteger("xp");
          await user.save();
          const embed = new EmbedBuilder()
            .setColor("Green")
            .setTitle("> XP Added")
            .setDescription(`XP berhasil ditambahkan ke pengguna **${interaction.options.getUser("user").username}** sebanyak **${interaction.options.getInteger("xp")}** XP, sekarang XPnya adalah **${user.xp}** XP.`)
            .setTimestamp()
            .setFooter({
              text: `sistem leveling`,
              iconURL: interaction.client.user.displayAvatarURL(),
            });

          return interaction.editReply({ embeds: [embed] });
        }
        case "xp-set": {
          const user = await User.findOne({ where: { userId: interaction.options.getUser("user").id } });
          if (!user) {
            return interaction.editReply({ content: "Pengguna tidak ditemukan." });
          }
          user.xp = interaction.options.getInteger("xp");
          await user.save();
          const embed = new EmbedBuilder()
            .setColor("Green")
            .setTitle("> XP Set")
            .setDescription(`XP berhasil diatur ke pengguna **${interaction.options.getUser("user").username}** sekarang XPnya adalah **${user.xp}** XP.`)
            .setTimestamp()
            .setFooter({
              text: `sistem leveling`,
              iconURL: interaction.client.user.displayAvatarURL(),
            });

          return interaction.editReply({ embeds: [embed] });
        }
      }
    } catch (error) {
      console.error("Error executing profile command:", error);
      interaction.editReply({
        content: "Terjadi kesalahan saat mencoba mengambil profil level.",
      });
    }
  },
};
