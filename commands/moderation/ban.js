const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const checkPermission = require("../../helpers/checkPermission");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Ban user dari server.")
    .addUserOption((option) => option.setName("user").setDescription("User untuk diban").setRequired(true)),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    if (!checkPermission(interaction.member)) {
      return interaction.editReply({ content: "❌ Kamu tidak punya izin untuk menggunakan perintah ini." });
    }
    const user = interaction.options.getUser("user");

    if (!interaction.member.permissions.has("BAN_MEMBERS")) {
      return interaction.editReply({ content: "Kamu tidak memiliki izin untuk memban user." });
    }

    const member = await interaction.guild.members.fetch(user.id);

    if (member) {
      await member.ban({ reason: "Member diban oleh command." });
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("> Ban")
        .setDescription(`🚫 | **${user.tag}** telah diban dari server.`)
        .setThumbnail(interaction.client.user.displayAvatarURL())
        .setTimestamp()
        .setFooter({
          text: `Sistem`,
          iconURL: interaction.client.user.displayAvatarURL(),
        });
      return interaction.editReply({ embeds: [embed] });
    } else {
      return interaction.editReply({ content: "User tidak ada di server ini!" });
    }
  },
};
