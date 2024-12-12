const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const checkPermission = require("../../helpers/checkPermission");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick user dari server.")
    .addUserOption((option) => option.setName("user").setDescription("User untuk dikick").setRequired(true)),
  async execute(interaction) {
    if (!checkPermission(interaction.member)) {
      return interaction.reply({ content: "❌ Kamu tidak punya izin untuk menggunakan perintah ini.", ephemeral: true });
    }
    const user = interaction.options.getUser("user");

    if (!interaction.member.permissions.has("KICK_MEMBERS")) {
      return interaction.reply({ content: "Kamu tidak memiliki izin untuk mengeluarkan member.", ephemeral: true });
    }

    const member = await interaction.guild.members.fetch(user.id);

    if (member) {
      await member.kick("Member dikeluarkan oleh command.");
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("> Member dikeluarkan")
        .setDescription(`🔨 | **${user.tag}** telah dikeluarkan dari server.`)
        .setTimestamp(new Date())
        .setFooter({ text: `Dikeluarkan oleh ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });
      return interaction.reply({ embeds: [embed] });
    } else {
      return interaction.reply({ content: "User tidak ada di server ini!", ephemeral: true });
    }
  },
};
