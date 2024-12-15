const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const Invite = require("../../database/models/invite"); // Assuming you have an Invite model
const checkPermission = require("../../helpers/checkPermission");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("invites")
    .setDescription("Kelola undangan dan hadiah")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("user")
        .setDescription("Periksa undangan pengguna")
        .addUserOption((option) => option.setName("user").setDescription("Pengguna yang akan diperiksa").setRequired(true))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription("Tambahkan undangan ke pengguna (Hanya pemilik)")
        .addUserOption((option) => option.setName("user").setDescription("Pengguna yang akan ditambahkan undangannya").setRequired(true))
        .addIntegerOption((option) => option.setName("number").setDescription("Jumlah undangan").setRequired(true))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setDescription("Hapus undangan dari pengguna (Hanya pemilik)")
        .addUserOption((option) => option.setName("user").setDescription("Pengguna yang akan dihapus undangannya").setRequired(true))
        .addIntegerOption((option) => option.setName("number").setDescription("Jumlah undangan").setRequired(true))
    )
    .addSubcommand((subcommand) => subcommand.setName("leaderboard").setDescription("Lihat papan peringkat pengundang teratas"))
    .addSubcommand((subcommand) =>
      subcommand
        .setName("reset")
        .setDescription("Atur ulang undangan pengguna (Hanya pemilik)")
        .addUserOption((option) => option.setName("user").setDescription("Pengguna yang akan diatur ulang").setRequired(true))
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    try {
      const subcommand = interaction.options.getSubcommand();
      const targetUser = interaction.options.getUser("user");
      const number = interaction.options.getInteger("number");
      const guildId = interaction.guild.id;

      if (!checkPermission(interaction.member)) {
        return interaction.editReply({ content: "❌ Kamu tidak punya izin untuk menggunakan perintah ini." });
      }
      const embed = new EmbedBuilder().setColor("Blue").setFooter({ text: "Sistem", iconURL: interaction.client.user.displayAvatarURL() }).setTimestamp().setThumbnail(interaction.client.user.displayAvatarURL());
      switch (subcommand) {
        case "user": {
          // Check a user's invites
          const userInvites = await Invite.findOne({ where: { userId: targetUser.id, guildId } });
          const invitesCount = userInvites ? userInvites.invites : 0;
          const userEmbed = embed.setDescription(`${targetUser.username} memiliki ${invitesCount} undangan.`);
          return interaction.editReply({ embeds: [userEmbed] });
        }

        case "add": {
          // Add invites to a user
          const userInvites = await Invite.upsert({ userId: targetUser.id, guildId, invites: number }, { returning: true });
          const addEmbed = embed.setDescription(`Menambahkan ${number} undangan ke ${targetUser.username}. Sekarang mereka memiliki ${userInvites[0].invites} undangan.`);
          return interaction.editReply({ embeds: [addEmbed] });
        }

        case "remove": {
          // Remove invites from a user
          const userInvites = await Invite.findOne({ where: { userId: targetUser.id, guildId } });
          const updatedInvites = userInvites ? userInvites.invites - number : -number;
          await Invite.upsert({ userId: targetUser.id, guildId, invites: updatedInvites });
          const removeEmbed = embed.setDescription(`Menghapus ${number} undangan dari ${targetUser.username}. Sekarang mereka memiliki ${updatedInvites} undangan.`);
          return interaction.editReply({ embeds: [removeEmbed] });
        }

        case "leaderboard": {
          // Display the invite leaderboard using EmbedBuilder
          const topInviters = await Invite.findAll({
            where: { guildId },
            order: [["invites", "DESC"]],
            limit: 10,
          });
          if (topInviters.length === 0) {
            return interaction.editReply({ content: "Belum ada data undangan yang tersedia." });
          }

          const leaderboard = topInviters.map((invite, index) => `${index + 1}. <@${invite.userId}> - **${invite.invites} undangan**`).join("\n");

          const leaderboardEmbed = new EmbedBuilder()
            .setTitle("🏆 Papan Peringkat Undangan")
            .setColor("Gold")
            .setDescription(leaderboard)
            .setFooter({ text: `Top ${topInviters.length} pengundang di ${interaction.guild.name}`, iconURL: interaction.client.user.displayAvatarURL() })
            .setTimestamp();

          return interaction.editReply({ embeds: [leaderboardEmbed] });
        }

        case "reset": {
          // Reset a user's invites
          await Invite.upsert({ userId: targetUser.id, guildId, invites: 0 });
          const resetEmbed = embed.setDescription(`Mengatur ulang undangan untuk ${targetUser.username}.`);
          return interaction.editReply({ embeds: [resetEmbed] });
        }
      }
    } catch (error) {
      console.error("Error during invite command execution:", error);
      return interaction.editReply({ content: "❌ | Terjadi kesalahan saat menjalankan perintah ini. Silakan coba lagi." });
    }
  },
};
