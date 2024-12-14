const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const checkPermission = require("../../helpers/checkPermission");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Mutes a user in a voice channel.")
    .addUserOption((option) => option.setName("user").setDescription("User to mute").setRequired(true)),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    if (!checkPermission(interaction.member)) {
      return interaction.editReply({ content: "❌ Kamu tidak punya izin untuk menggunakan perintah ini." });
    }
    const user = interaction.options.getUser("user");

    if (!interaction.member.permissions.has("MUTE_MEMBERS")) {
      return interaction.editReply({ content: "You do not have permission to mute members." });
    }

    const member = await interaction.guild.members.fetch(user.id);

    if (member) {
      await member.voice.setMute(true, "Muted by command.");
      const embed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("> Muted")
        .setDescription(`**${user.tag}** telah dimatikan oleh **${interaction.user.tag}** melalui command.`)
        .setThumbnail(interaction.client.user.displayAvatarURL())
        .setTimestamp()
        .setFooter({ text: `Diamatkan oleh ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });
      return interaction.editReply({ embeds: [embed] });
    } else {
      return interaction.editReply({ content: "That user is not in this server!" });
    }
  },
};
