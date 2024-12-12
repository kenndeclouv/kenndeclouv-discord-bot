const { SlashCommandBuilder } = require("discord.js");
const checkPermission = require("../../helpers/checkPermission");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Ban user dari server.")
    .addUserOption((option) => option.setName("user").setDescription("User untuk diban").setRequired(true)),
  async execute(interaction) {
    if (!checkPermission(interaction.member)) {
      return interaction.reply({ content: "❌ Kamu tidak punya izin untuk menggunakan perintah ini.", ephemeral: true });
    }
    const user = interaction.options.getUser("user");

    if (!interaction.member.permissions.has("BAN_MEMBERS")) {
      return interaction.reply({ content: "Kamu tidak memiliki izin untuk memban user.", ephemeral: true });
    }

    const member = await interaction.guild.members.fetch(user.id);

    if (member) {
      await member.ban({ reason: "Member diban oleh command." });
      return interaction.reply(`🚫 | **${user.tag}** telah diban dari server.`);
    } else {
      return interaction.reply({ content: "User tidak ada di server ini!", ephemeral: true });
    }
  },
};
