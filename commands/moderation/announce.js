const { SlashCommandBuilder } = require("discord.js");
const checkPermission = require("../../helpers/checkPermission");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("announce")
    .setDescription("Membuat pengumuman di channel yang ditentukan.")
    .addChannelOption((option) => option.setName("channel").setDescription("Channel untuk pengumuman").setRequired(true))
    .addStringOption((option) => option.setName("message").setDescription("Pesan pengumuman").setRequired(true)),
  async execute(interaction) {
    if (!checkPermission(interaction.member)) {
      return interaction.reply({ content: "❌ Kamu tidak punya izin untuk menggunakan perintah ini.", ephemeral: true });
    }
    const channel = interaction.options.getChannel("channel");
    const message = interaction.options.getString("message");

    if (!interaction.member.permissions.has("SEND_MESSAGES")) {
      return interaction.reply({ content: "kamu tidak memiliki izin untuk mengirim pesan.", ephemeral: true });
    }

    await channel.send(`📢 Pengumuman: ${message}`);
    return interaction.reply(`✅ | Pengumuman dikirim di **${channel.name}**.`);
  },
};
