const { SlashCommandBuilder } = require("discord.js");
const checkPermission = require("../../helpers/checkPermission");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("Displays information about a user.")
    .addUserOption((option) => option.setName("user").setDescription("User to get info about").setRequired(false)),
  async execute(interaction) {
    if (!checkPermission(interaction.member)) {
      return interaction.reply({ content: "❌ Kamu tidak punya izin untuk menggunakan perintah ini.", ephemeral: true });
    }
    const user = interaction.options.getUser("user") || interaction.user;

    const member = await interaction.guild.members.fetch(user.id);
    const userInfo = `**User:** ${user.tag}\n**Joined Server On:** ${member.joinedAt.toDateString()}\n**Roles:** ${member.roles.cache.map((role) => role.name).join(", ") || "None"}`;
    return interaction.reply({ content: userInfo, ephemeral: true });
  },
};
