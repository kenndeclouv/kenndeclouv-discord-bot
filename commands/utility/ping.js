const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder().setName("ping").setDescription("Displays the bot latency and API latency."),
  async execute(interaction) {
    try {
      const sent = await interaction.reply({ content: "Pinging...", fetchReply: true, ephemeral: true });
      const botLatency = sent.createdTimestamp - interaction.createdTimestamp;
      const apiLatency = Math.round(interaction.client.ws.ping);

      const embed = new EmbedBuilder()
        .setColor("Blue")
        .setTitle("🏓 Pong!")
        .addFields({ name: "Bot Latency", value: `${botLatency}ms`, inline: true }, { name: "API Latency", value: `${apiLatency}ms`, inline: true })
        .setThumbnail(interaction.client.user.displayAvatarURL())
        .setTimestamp();

      await interaction.editReply({ content: null, embeds: [embed] });
    } catch (error) {
      console.error("Error during ping command execution:", error);
      return interaction.editReply({ content: "❌ | Terjadi kesalahan saat menjalankan perintah ini. Silakan coba lagi." });
    }
  },
};
