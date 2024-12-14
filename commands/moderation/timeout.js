const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const checkPermission = require("../../helpers/checkPermission");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Puts a user in timeout for a specified duration.")
    .addUserOption((option) => option.setName("user").setDescription("User to timeout").setRequired(true))
    .addIntegerOption((option) => option.setName("duration").setDescription("Duration in seconds").setRequired(true)),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    if (!checkPermission(interaction.member)) {
      return interaction.editReply({ content: "❌ Kamu tidak punya izin untuk menggunakan perintah ini." });
    }
    const user = interaction.options.getUser("user");
    const duration = interaction.options.getInteger("duration") * 1000;

    if (!interaction.member.permissions.has("MODERATE_MEMBERS")) {
      return interaction.editReply({ content: "Kamu tidak memiliki izin untuk membatasi anggota." });
    }

    const member = await interaction.guild.members.fetch(user.id);

    if (member) {
      await member.timeout(duration, "Timeout by command.");
      const embed = new EmbedBuilder()
        .setColor("Green")
        .setTitle(`> Timeout member`)
        .setDescription(`<@${user.id}> telah dibatasi selama **${duration / 1000}** detik.`)
        .setThumbnail(interaction.client.user.displayAvatarURL())
        .setTimestamp()
        .setFooter({ text: `Sistem`, iconURL: interaction.client.user.displayAvatarURL() });
      return interaction.editReply({ embeds: [embed] });
    } else {
      return interaction.editReply({ content: "Pengguna tersebut tidak ada di server ini!" });
    }
  },
};
