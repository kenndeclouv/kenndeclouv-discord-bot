const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder, Colors } = require("discord.js"); // Import Colors
const Suggestion = require("../../database/models/suggestion"); // Import the Suggestion model
const checkPermission = require("../../helpers/checkPermission");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("suggestion")
    .setDescription("Suggestion commands")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("setup")
        .setDescription("Setup suggestion channel")
        .addChannelOption((option) => option.setName("channel").setDescription("Channel for suggestions").setRequired(true))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("accept")
        .setDescription("Accept a suggestion")
        .addStringOption((option) => option.setName("message_id").setDescription("Message ID of the suggestion").setRequired(true))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("decline")
        .setDescription("Decline a suggestion")
        .addStringOption((option) => option.setName("message_id").setDescription("Message ID of the suggestion").setRequired(true))
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    try {
      if (!checkPermission(interaction.member)) {
        return interaction.editReply({ content: "❌ Kamu tidak punya izin untuk menggunakan perintah ini." });
      }
      const subcommand = interaction.options.getSubcommand();
      const guildId = interaction.guild.id;

      if (subcommand === "setup") {
        const channel = interaction.options.getChannel("channel");
        let suggestionSetup = await Suggestion.findOne({ guildId });

        if (!suggestionSetup) {
          suggestionSetup = new Suggestion({
            guildId,
            channelId: channel.id,
          });
          await suggestionSetup.save();
          await interaction.editReply(`Channel saran berhasil diatur ke ${channel}.`);
        } else {
          suggestionSetup.channelId = channel.id;
          await suggestionSetup.save();
          await interaction.editReply(`Channel saran berhasil diupdate ke ${channel}.`);
        }
      } else if (subcommand === "accept" || subcommand === "decline") {
        const messageId = interaction.options.getString("message_id");
        const suggestionData = await Suggestion.findOne({ guildId });

        if (!suggestionData) {
          return interaction.editReply("Tidak ada saran yang ditemukan.");
        }

        const suggestion = suggestionData.suggestions.find((s) => s.messageId === messageId);
        if (!suggestion) {
          return interaction.editReply("Saran tidak ditemukan.");
        }

        suggestion.accepted = subcommand === "accept";
        suggestion.declined = subcommand === "decline";
        await suggestionData.save();

        const channel = await interaction.guild.channels.fetch(suggestionData.channelId);
        const message = await channel.messages.fetch(messageId);
        const embed = new EmbedBuilder(message.embeds[0]) // Create a new EmbedBuilder with existing embed data
          .setColor(subcommand === "accept" ? Colors.Green : Colors.Red); // Use color constants
        await message.edit({ embeds: [embed] });

        await interaction.editReply(`Saran ${subcommand === "accept" ? "diterima" : "ditolak"}.`);
      }
    } catch (error) {
      console.error("Error during suggestion command execution:", error);
      return interaction.editReply({ content: "❌ | Terjadi kesalahan saat menjalankan perintah ini. Silakan coba lagi." });
    }
  },
};
