const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const User = require("../../database/models/User");
const checkPermission = require("../../helpers/checkPermission");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("warnings")
    .setDescription("Menampilkan peringatan pengguna.")
    .addUserOption((option) => option.setName("user").setDescription("Pengguna untuk memeriksa").setRequired(false)),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    if (!checkPermission(interaction.member)) {
      return interaction.editReply({ content: "❌ Kamu tidak punya izin untuk menggunakan perintah ini." });
    }
    const user = interaction.options.getUser("user") || interaction.user;
    const userRecord = await User.findOne({ userId: user.id });

    if (!userRecord || userRecord.warnings.length === 0) {
      return interaction.editReply({ content: `⚠️ | **${user.tag}** tidak memiliki peringatan.` });
    }

    const warningsList = userRecord.warnings.map((warning) => `Reason: ${warning.reason}, Date: ${warning.date.toLocaleString()}`).join("\n");
    const embed = new EmbedBuilder()
      .setColor("Green")
      .setTitle(`> Warnings`)
      .setDescription(`Peringatan untuk **${user.tag}**:\n${warningsList}`)
      .setThumbnail(interaction.client.user.displayAvatarURL())
      .setTimestamp()
      .setFooter({ text: `Sistem`, iconURL: interaction.client.user.displayAvatarURL() });
    return interaction.editReply({ embeds: [embed] });
  },
};
