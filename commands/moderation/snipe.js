// commands/moderation/snipe.js
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const messageDeleteEvent = require("../../events/messageDelete");
const checkPermission = require("../../helpers/checkPermission");

module.exports = {
  data: new SlashCommandBuilder().setName("snipe").setDescription("Shows the most recent deleted message in this channel."),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    if (!checkPermission(interaction.member)) {
      return interaction.editReply({ content: "❌ Kamu tidak punya izin untuk menggunakan perintah ini." });
    }
    const lastDeletedMessage = messageDeleteEvent.getLastDeletedMessage();

    if (!lastDeletedMessage) {
      return interaction.editReply({ content: "Tidak ada pesan yang dihapus untuk diambil." });
    }

    const snipeEmbed = new EmbedBuilder()
      .setColor("#ff0000")
      .setAuthor({ name: lastDeletedMessage.author.tag, iconURL: lastDeletedMessage.author.displayAvatarURL() })
      .setDescription(lastDeletedMessage.content || "No content")
      .setTimestamp(lastDeletedMessage.createdAt)
      .setThumbnail(interaction.client.user.displayAvatarURL())
      .setFooter({ text: `Message ID: ${lastDeletedMessage.id}` });

    return interaction.editReply({ embeds: [snipeEmbed] });
  },
};
