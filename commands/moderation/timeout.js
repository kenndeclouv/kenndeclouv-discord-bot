const { SlashCommandBuilder } = require("discord.js");
const checkPermission = require("../../helpers/checkPermission");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Puts a user in timeout for a specified duration.")
    .addUserOption((option) => option.setName("user").setDescription("User to timeout").setRequired(true))
    .addIntegerOption((option) => option.setName("duration").setDescription("Duration in seconds").setRequired(true)),
  async execute(interaction) {
    if (!checkPermission(interaction.member)) {
      return interaction.reply({ content: "❌ Kamu tidak punya izin untuk menggunakan perintah ini.", ephemeral: true });
    }
    const user = interaction.options.getUser("user");
    const duration = interaction.options.getInteger("duration") * 1000;

    if (!interaction.member.permissions.has("MODERATE_MEMBERS")) {
      return interaction.reply({ content: "You do not have permission to timeout members.", ephemeral: true });
    }

    const member = await interaction.guild.members.fetch(user.id);

    if (member) {
      await member.timeout(duration, "Timeout by command.");
      return interaction.reply(`⏲️ | Timeout **${user.tag}** for ${duration / 1000} seconds.`);
    } else {
      return interaction.reply({ content: "That user is not in this server!", ephemeral: true });
    }
  },
};
