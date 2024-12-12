const { SlashCommandBuilder } = require("discord.js");
const checkPermission = require("../../helpers/checkPermission");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("slowmode")
    .setDescription("Sets the slowmode for the channel.")
    .addIntegerOption((option) => option.setName("duration").setDescription("Duration in seconds").setRequired(true)),
  async execute(interaction) {
    if (!checkPermission(interaction.member)) {
      return interaction.reply({ content: "❌ Kamu tidak punya izin untuk menggunakan perintah ini.", ephemeral: true });
    }
    const duration = interaction.options.getInteger("duration");

    if (!interaction.member.permissions.has("MANAGE_CHANNELS")) {
      return interaction.reply({ content: "You do not have permission to set slowmode.", ephemeral: true });
    }

    await interaction.channel.setRateLimitPerUser(duration);
    return interaction.reply(`⏳ | Slowmode set to **${duration}** seconds.`);
  },
};
