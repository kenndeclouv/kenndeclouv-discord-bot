const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const User = require("../../database/models/User");
const checkPermission = require("../../helpers/checkPermission");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Issues a warning to a user.")
    .addUserOption((option) => option.setName("user").setDescription("User to warn").setRequired(true))
    .addStringOption((option) => option.setName("reason").setDescription("Reason for the warning").setRequired(true)),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    if (!checkPermission(interaction.member)) {
      return interaction.editReply({ content: "❌ Kamu tidak punya izin untuk menggunakan perintah ini." });
    }
    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason");
    const member = await interaction.guild.members.fetch(user.id);

    if (!interaction.member.permissions.has("MANAGE_MESSAGES")) {
      return interaction.editReply({ content: "Kamu tidak memiliki izin untuk memberi peringatan." });
    }

    if (member) {
      const userRecord = await User.findOne({ userId: user.id });
      if (!userRecord) {
        return interaction.editReply({ content: "Pengguna tidak ditemukan di database!" });
      }
      userRecord.warnings.push({ reason, date: new Date() });
      await userRecord.save();
      const embed = new EmbedBuilder()
        .setColor("Green")
        .setTitle(`> Warn member`)
        .setDescription(`<@${user.id}> telah diberi peringatan karena: ${reason}`)
        .setThumbnail(interaction.client.user.displayAvatarURL())
        .setTimestamp()
        .setFooter({ text: `Sistem`, iconURL: interaction.client.user.displayAvatarURL() });
      return interaction.editReply({ embeds: [embed] });
    } else {
      return interaction.editReply({ content: "Pengguna tersebut tidak ada di server ini!" });
    }
  },
};
