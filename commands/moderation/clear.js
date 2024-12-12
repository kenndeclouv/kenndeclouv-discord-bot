const { SlashCommandBuilder } = require("discord.js");
const checkPermission = require("../../helpers/checkPermission");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Menghapus pesan dari channel.")
    .addIntegerOption((option) => option.setName("amount").setDescription("Jumlah pesan untuk dihapus").setRequired(true)),
  async execute(interaction) {
    if (!checkPermission(interaction.member)) {
      return interaction.reply({ content: "❌ Kamu tidak punya izin untuk menggunakan perintah ini.", ephemeral: true });
    }
    const amount = interaction.options.getInteger("amount");

    if (!interaction.member.permissions.has("MANAGE_MESSAGES")) {
      return interaction.reply({ content: "Kamu tidak memiliki izin untuk menghapus pesan.", ephemeral: true });
    }

    await interaction.channel.bulkDelete(amount, true);
    return interaction.reply(`🧹 | **${amount}** pesan telah dihapus.`);
  },
};
