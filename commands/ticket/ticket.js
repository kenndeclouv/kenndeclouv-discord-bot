const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionsBitField } = require("discord.js");
const Ticket = require("../../database/models/ticket");
const { createTranscript } = require("discord-html-transcripts"); // Untuk pembuatan transkrip
const checkPermission = require("../../helpers/checkPermission");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("Perintah sistem tiket")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("setup")
        .setDescription("Atur sistem tiket")
        .addChannelOption((option) => option.setName("channel").setDescription("Channel untuk pembuatan tiket").setRequired(true))
        .addRoleOption((option) => option.setName("staff-role").setDescription("Role untuk staf").setRequired(true))
        .addChannelOption((option) => option.setName("logs").setDescription("Channel log untuk tiket").setRequired(true))
        .addChannelOption((option) => option.setName("transcript").setDescription("Channel untuk transkrip").setRequired(true))
        .addStringOption((option) => option.setName("title").setDescription("Judul untuk pesan tiket").setRequired(true))
        .addStringOption((option) => option.setName("description").setDescription("Deskripsi untuk pesan tiket").setRequired(true))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setDescription("Hapus pengguna dari channel tiket")
        .addUserOption((option) => option.setName("user").setDescription("Pengguna yang akan dihapus").setRequired(true))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription("Tambahkan pengguna ke channel tiket")
        .addUserOption((option) => option.setName("user").setDescription("Pengguna yang akan ditambahkan").setRequired(true))
    )
    .addSubcommand((subcommand) => subcommand.setName("close").setDescription("Tutup tiket dan hapus channel tiket."))
    .addSubcommand((subcommand) => subcommand.setName("transcript").setDescription("Dapatkan transkrip dari tiket.")),

  async execute(interaction) {
    if (!checkPermission(interaction.member)) {
      return interaction.reply({ content: "❌ Kamu tidak punya izin untuk menggunakan perintah ini.", ephemeral: true });
    }
    const { options } = interaction;
    const subcommand = options.getSubcommand();

    if (subcommand === "setup") {
      const channel = options.getChannel("channel");
      const staffRole = options.getRole("staff-role");
      const logsChannel = options.getChannel("logs");
      const transcriptChannel = options.getChannel("transcript");
      const title = options.getString("title");
      const description = options.getString("description");

      // Buat dokumen tiket baru
      const ticket = new Ticket({
        channelId: channel.id,
        staffRoleId: staffRole.id,
        logsChannelId: logsChannel.id,
        transcriptChannelId: transcriptChannel.id,
        title,
        description,
      });

      await ticket.save();

      // Buat embed pembuatan tiket
      const ticketEmbed = new EmbedBuilder().setColor("#0099ff").setTitle(title).setDescription(description).setFooter({ text: "Klik tombol di bawah untuk membuat tiket." });

      const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("create_ticket").setLabel("Buat Tiket").setStyle(ButtonStyle.Primary));

      // Kirim embed di channel yang ditentukan
      await channel.send({ embeds: [ticketEmbed], components: [row] });
      await interaction.reply(`🎫 | Sistem tiket berhasil diatur di ${channel}. Judul: **${title}**.`);
    } else if (subcommand === "remove") {
      const user = options.getUser("user");
      const member = await interaction.guild.members.fetch(user.id);

      // Periksa apakah anggota ada di channel tiket
      if (interaction.channel.permissionsFor(member).has(PermissionsBitField.Flags.ViewChannel)) {
        await interaction.channel.permissionOverwrites.edit(user.id, { ViewChannel: false });
        await interaction.reply(`❌ | **${user.tag}** telah dihapus dari channel tiket.`);
      } else {
        await interaction.reply(`⚠️ | **${user.tag}** tidak ada di channel tiket.`);
      }
    } else if (subcommand === "add") {
      const user = options.getUser("user");
      const member = await interaction.guild.members.fetch(user.id);

      // Periksa apakah anggota ada di channel tiket
      if (!interaction.channel.permissionsFor(member).has(PermissionsBitField.Flags.ViewChannel)) {
        await interaction.channel.permissionOverwrites.edit(user.id, { ViewChannel: true });
        await interaction.reply(`✅ | **${user.tag}** telah ditambahkan ke channel tiket.`);
      } else {
        await interaction.reply(`⚠️ | **${user.tag}** sudah ada di channel tiket.`);
      }
    } else if (subcommand === "close") {
      // Tutup tiket
      const ticket = await Ticket.findOne({ where: { channelId: interaction.channel.id } });
      if (!ticket) {
        return interaction.reply(`❌ | Channel ini tidak terkait dengan tiket yang terbuka.`);
      }

      // Ambil channel log dan transkrip dari database
      const logsChannel = interaction.guild.channels.cache.get(ticket.logsChannelId);
      const transcriptChannel = interaction.guild.channels.cache.get(ticket.transcriptChannelId);

      // Buat transkrip dari tiket
      const transcript = await createTranscript(interaction.channel);

      // Kirim transkrip ke channel transkrip
      await transcriptChannel.send({
        content: `Transkrip untuk tiket #${ticket.ticketNumber} dibuat oleh <@${ticket.userId}>.`,
        files: [transcript],
      });

      // Opsional, kirim notifikasi ke channel log
      if (logsChannel) {
        await logsChannel.send(`📝 | Tiket #${ticket.ticketNumber} ditutup oleh ${interaction.user.tag} dan transkrip disimpan.`);
      }

      // Hapus tiket dari database
      await Ticket.deleteOne({ where: { channelId: interaction.channel.id } });

      // Hapus channel tiket
      await interaction.channel.delete();
    } else if (subcommand === "transcript") {
      // Ambil tiket dari database
      const ticket = await Ticket.findOne({ where: { channelId: interaction.channel.id } });
      if (!ticket) {
        return interaction.reply(`❌ | Channel ini tidak terkait dengan tiket yang terbuka.`);
      }

      // Buat transkrip dari tiket
      const transcript = await createTranscript(interaction.channel);

      // Kirim transkrip ke channel transkrip
      const transcriptChannel = interaction.guild.channels.cache.get(ticket.transcriptChannelId);
      await transcriptChannel.send({
        content: `Transkrip untuk tiket #${ticket.ticketNumber} dibuat oleh <@${ticket.userId}>.`,
        files: [transcript],
      });

      await interaction.reply(`📜 | Transkrip untuk tiket ini telah dikirim ke ${transcriptChannel}.`);
    }
  },
};
