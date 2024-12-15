const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder, version } = require("discord.js");
const os = require("os");

module.exports = {
  data: new SlashCommandBuilder().setName("stats").setDescription("Menampilkan statistik bot."),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    try {
      const { client } = interaction;
      const uptime = formatDuration(client.uptime);
      const memoryUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
      const totalGuilds = client.guilds.cache.size;
      const totalUsers = client.users.cache.size;
      const nodeVersion = process.version;
      const discordJsVersion = version;
      const cpuModel = os.cpus()[0].model;

      const embed = new EmbedBuilder()
        .setColor("Purple")
        .setTitle("📊 Statistik Bot")
        .addFields({ name: "Uptime", value: uptime, inline: true }, { name: "Penggunaan Memori", value: `${memoryUsage} MB`, inline: true }, { name: "Server", value: `${totalGuilds}`, inline: true }, { name: "Pengguna", value: `${totalUsers}`, inline: true }, { name: "Node.js", value: nodeVersion, inline: true }, { name: "discord.js", value: `v${discordJsVersion}`, inline: true }, { name: "CPU", value: cpuModel, inline: false })
        .setThumbnail(interaction.client.user.displayAvatarURL())
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error("Error during stats command execution:", error);
      return interaction.editReply({ content: "❌ | Terjadi kesalahan saat menjalankan perintah ini. Silakan coba lagi." });
    }
  },
};

function formatDuration(ms) {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));

  const parts = [];
  if (days) parts.push(`${days}h`);
  if (hours) parts.push(`${hours}j`);
  if (minutes) parts.push(`${minutes}m`);
  if (seconds) parts.push(`${seconds}s`);

  return parts.join(" ");
}
