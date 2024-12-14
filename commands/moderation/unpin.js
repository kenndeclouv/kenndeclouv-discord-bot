const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const checkPermission = require("../../helpers/checkPermission");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("unpin")
    .setDescription("Unpins a message in the channel.")
    .addStringOption((option) => option.setName("message_id").setDescription("ID of the message to unpin").setRequired(true)),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    if (!checkPermission(interaction.member)) {
      return interaction.editReply({ content: "❌ Kamu tidak punya izin untuk menggunakan perintah ini." });
    }
    const messageId = interaction.options.getString("message_id");

    if (!interaction.member.permissions.has("MANAGE_MESSAGES")) {
      return interaction.editReply({ content: "Kamu tidak memiliki izin untuk mengunpin pesan." });
    }

    const message = await interaction.channel.messages.fetch(messageId);
    if (!message) return interaction.editReply({ content: "Pesan tidak ditemukan!" });

    await message.unpin();
    const embed = new EmbedBuilder()
      .setColor("Green")
      .setTitle(`> Unpin message`)
      .setDescription(`Pesan dengan ID **${messageId}** telah diunpin.`)
      .setThumbnail(interaction.client.user.displayAvatarURL())
      .setTimestamp()
      .setFooter({ text: `Sistem`, iconURL: interaction.client.user.displayAvatarURL() });
    return interaction.editReply({ embeds: [embed] });
  },
};
