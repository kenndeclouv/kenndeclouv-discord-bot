const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const checkPermission = require("../../helpers/checkPermission");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("unmute")
    .setDescription("Unmutes a user in a voice channel.")
    .addUserOption((option) => option.setName("user").setDescription("User to unmute").setRequired(true)),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    if (!checkPermission(interaction.member)) {
      return interaction.editReply({ content: "❌ Kamu tidak punya izin untuk menggunakan perintah ini." });
    }
    const user = interaction.options.getUser("user");

    if (!interaction.member.permissions.has("MUTE_MEMBERS")) {
      return interaction.editReply({ content: "Kamu tidak memiliki izin untuk membuka suara." });
    }

    const member = await interaction.guild.members.fetch(user.id);

    if (member) {
      await member.voice.setMute(false, "Unmuted by command.");
      const embed = new EmbedBuilder()
        .setColor("Green")
        .setTitle(`> Unmute member`)
        .setDescription(`<@${user.id}> telah diunmute.`)
        .setThumbnail(interaction.client.user.displayAvatarURL())
        .setTimestamp()
        .setFooter({ text: `Sistem`, iconURL: interaction.client.user.displayAvatarURL() });
      return interaction.editReply({ embeds: [embed] });
    } else {
      return interaction.editReply({ content: "Pengguna tersebut tidak ada di server ini!" });
    }
  },
};
