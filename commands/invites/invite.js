const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const Invite = require('../../database/models/invite'); // Assuming you have an Invite model

module.exports = {
  data: new SlashCommandBuilder()
    .setName('invites')
    .setDescription('Kelola undangan dan hadiah')
    .addSubcommand(subcommand =>
      subcommand.setName('user')
        .setDescription('Periksa undangan pengguna')
        .addUserOption(option => option.setName('user').setDescription('Pengguna yang akan diperiksa').setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand.setName('add')
        .setDescription('Tambahkan undangan ke pengguna (Hanya pemilik)')
        .addUserOption(option => option.setName('user').setDescription('Pengguna yang akan ditambahkan undangannya').setRequired(true))
        .addIntegerOption(option => option.setName('number').setDescription('Jumlah undangan').setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand.setName('remove')
        .setDescription('Hapus undangan dari pengguna (Hanya pemilik)')
        .addUserOption(option => option.setName('user').setDescription('Pengguna yang akan dihapus undangannya').setRequired(true))
        .addIntegerOption(option => option.setName('number').setDescription('Jumlah undangan').setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand.setName('leaderboard')
        .setDescription('Lihat papan peringkat pengundang teratas'))
    .addSubcommand(subcommand =>
      subcommand.setName('reset')
        .setDescription('Atur ulang undangan pengguna (Hanya pemilik)')
        .addUserOption(option => option.setName('user').setDescription('Pengguna yang akan diatur ulang').setRequired(true))),
    
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const targetUser = interaction.options.getUser('user');
    const number = interaction.options.getInteger('number');
    const guildId = interaction.guild.id;
    const isOwner = interaction.guild.ownerId === interaction.user.id;

    // Check for owner-only commands
    if (!isOwner && ['add', 'remove', 'reset'].includes(subcommand)) {
      return interaction.reply({ content: 'Hanya pemilik server yang dapat menggunakan perintah ini!', ephemeral: true });
    }

    switch (subcommand) {
      case 'user': {
        // Check a user's invites
        const userInvites = await Invite.findOne({ userId: targetUser.id, guildId });
        const invitesCount = userInvites ? userInvites.invites : 0;
        return interaction.reply({ content: `${targetUser.username} memiliki ${invitesCount} undangan.` });
      }

      case 'add': {
        // Add invites to a user
        const userInvites = await Invite.findOneAndUpdate(
          { userId: targetUser.id, guildId },
          { $inc: { invites: number } },
          { upsert: true, new: true }
        );
        return interaction.reply({ content: `Menambahkan ${number} undangan ke ${targetUser.username}. Sekarang mereka memiliki ${userInvites.invites} undangan.` });
      }

      case 'remove': {
        // Remove invites from a user
        const userInvites = await Invite.findOneAndUpdate(
          { userId: targetUser.id, guildId },
          { $inc: { invites: -number } },
          { upsert: true, new: true }
        );
        return interaction.reply({ content: `Menghapus ${number} undangan dari ${targetUser.username}. Sekarang mereka memiliki ${userInvites.invites} undangan.` });
      }

      case 'leaderboard': {
        // Display the invite leaderboard using EmbedBuilder
        const topInviters = await Invite.find({ guildId }).sort({ invites: -1 }).limit(10);
        if (topInviters.length === 0) {
          return interaction.reply({ content: 'Belum ada data undangan yang tersedia.' });
        }

        const leaderboard = topInviters.map((invite, index) =>
          `${index + 1}. <@${invite.userId}> - **${invite.invites} undangan**`
        ).join('\n');

        const leaderboardEmbed = new EmbedBuilder()
          .setTitle('🏆 Papan Peringkat Undangan')
          .setColor('Gold')
          .setDescription(leaderboard)
          .setFooter({ text: `Top ${topInviters.length} pengundang di ${interaction.guild.name}` })
          .setTimestamp();

        return interaction.reply({ embeds: [leaderboardEmbed] });
      }

      case 'reset': {
        // Reset a user's invites
        await Invite.findOneAndUpdate(
          { userId: targetUser.id, guildId },
          { invites: 0 },
          { new: true }
        );
        return interaction.reply({ content: `Mengatur ulang undangan untuk ${targetUser.username}.` });
      }
    }
  }
};
