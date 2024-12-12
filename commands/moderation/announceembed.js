const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require("discord.js");
const checkPermission = require("../../helpers/checkPermission");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("announceembed")
    .setDescription("Membuat pengumuman di channel yang ditentukan dengan embed.")
    .addChannelOption((option) => option.setName("channel").setDescription("Channel untuk pengumuman").setRequired(true))
    .addStringOption((option) => option.setName("title").setDescription("Judul pengumuman").setRequired(true))
    .addStringOption((option) => option.setName("description").setDescription("Deskripsi pengumuman").setRequired(true))
    .addBooleanOption((option) => option.setName("timestamp").setDescription("Timestamp pengumuman").setRequired(true))
    .addStringOption((option) => option.setName("image").setDescription("Gambar pengumuman").setRequired(false))
    .addStringOption((option) => option.setName("thumbnail").setDescription("Thumbnail pengumuman").setRequired(false))
    .addStringOption((option) => option.setName("footer").setDescription("Footer pengumuman").setRequired(false))
    .addStringOption((option) => option.setName("color").setDescription("Color pengumuman").setRequired(false)),
  async execute(interaction) {
    if (!checkPermission(interaction.member)) {
      return interaction.reply({ content: "❌ Kamu tidak punya izin untuk menggunakan perintah ini.", ephemeral: true });
    }
    const channel = interaction.options.getChannel("channel");
    const title = interaction.options.getString("title");
    const description = interaction.options.getString("description");
    const image = interaction.options.getString("image");
    const thumbnail = interaction.options.getString("thumbnail");
    const footer = interaction.options.getString("footer");
    const timestamp = interaction.options.getBoolean("timestamp");
    const color = interaction.options.getString("color") ?? "#00FFFF";

    // cek izin
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.SendMessages)) {
      return interaction.reply({
        content: "kamu tidak memiliki izin untuk mengirim pesan.",
        ephemeral: true,
      });
    }

    // buat embed
    const embed = new EmbedBuilder().setTitle(title).setDescription(description).setColor(color);

    if (image) embed.setImage(image);
    if (thumbnail) embed.setThumbnail(thumbnail);
    if (footer) embed.setFooter({ text: footer });
    if (timestamp) embed.setTimestamp(new Date());

    // kirim embed ke channel
    await channel.send({ embeds: [embed] });

    return interaction.reply({
      content: `✅ | Pengumuman dikirim di **${channel.name}**.`,
      ephemeral: true,
    });
  },
};
