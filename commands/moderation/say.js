const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("say")
    .setDescription("Membuat bot mengirim pesan.")
    .addStringOption((option) => option.setName("message").setDescription("Pesan untuk dikirim").setRequired(true)),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    if (!checkPermission(interaction.member)) {
      return interaction.editReply({ content: "❌ Kamu tidak punya izin untuk menggunakan perintah ini." });
    }
    const message = interaction.options.getString("message");

    if (!interaction.member.permissions.has("MANAGE_MESSAGES")) {
      return interaction.editReply({ content: "Kamu tidak memiliki izin untuk menggunakan perintah ini." });
    }

    await interaction.channel.send(message);
    return interaction.editReply(`✅ | Bot mengirim pesan: ${message}`);
  },
};
