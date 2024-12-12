const { SlashCommandBuilder } = require("discord.js");
const checkPermission = require("../../helpers/checkPermission");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("lock")
    .setDescription("Locks a channel to prevent messages.")
    .addChannelOption((option) => option.setName("channel").setDescription("Channel to lock").setRequired(false)),
  async execute(interaction) {
    if (!checkPermission(interaction.member)) {
      return interaction.reply({ content: "❌ Kamu tidak punya izin untuk menggunakan perintah ini.", ephemeral: true });
    }
    const channel = interaction.options.getChannel("channel") || interaction.channel;

    if (!interaction.member.permissions.has("MANAGE_CHANNELS")) {
      return interaction.reply({ content: "You do not have permission to lock channels.", ephemeral: true });
    }

    await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SEND_MESSAGES: false });
    return interaction.reply(`🔒 | Locked **${channel.name}**.`);
  },
};
