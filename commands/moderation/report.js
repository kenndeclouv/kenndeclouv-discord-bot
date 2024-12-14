require("dotenv").config();
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("report")
    .setDescription("Melaporkan pengguna kepada moderator.")
    .addUserOption((option) => option.setName("user").setDescription("Pengguna yang dilaporkan").setRequired(true))
    .addStringOption((option) => option.setName("reason").setDescription("Alasan untuk laporan").setRequired(true)),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason");

    const reportChannel = interaction.guild.channels.cache.get(process.env.REPORT_CHANNEL_ID);
    if (!reportChannel) return interaction.editReply({ content: "Saluran laporan tidak ada." });

    const embed = new EmbedBuilder()
      .setColor("Red")
      .setTitle("> Report")
      .setDescription(`**${user.tag}** telah dilaporkan oleh **${interaction.user.tag}** dengan alasan: ${reason}`)
      .setThumbnail(interaction.client.user.displayAvatarURL())
      .setTimestamp()
      .setFooter({ text: `Dilaporkan oleh ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });
    await reportChannel.send({ embeds: [embed] });
    return interaction.editReply(`✅ | Telah melaporkan **${user.tag}**. Terima kasih telah melaporkan.`);
  },
};
