const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");

function formatDuration(ms) {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));

  const parts = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  if (seconds) parts.push(`${seconds}s`);

  return parts.join(" ");
}

module.exports = {
  data: new SlashCommandBuilder().setName("uptime").setDescription("Menampilkan waktu online bot."),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    try {
      const uptime = formatDuration(interaction.client.uptime);
      const embed = new EmbedBuilder().setColor("Green").setTitle("> Waktu Online Bot").setDescription(`Bot ini sudah online selama **${uptime}**.`).setThumbnail(interaction.client.user.displayAvatarURL()).setTimestamp().setFooter({ text: "Waktu online bot adalah waktu sejak bot mulai berjalan." });
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error("Error during uptime command execution:", error);
      return interaction.editReply({ content: "❌ | Terjadi kesalahan saat menjalankan perintah ini. Silakan coba lagi." });
    }
  },
};
