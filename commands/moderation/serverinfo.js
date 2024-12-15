const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const checkPermission = require("../../helpers/checkPermission");

module.exports = {
  data: new SlashCommandBuilder().setName("serverinfo").setDescription("Displays information about the server."),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    if (!checkPermission(interaction.member)) {
      return interaction.editReply({ content: "❌ Kamu tidak punya izin untuk menggunakan perintah ini." });
    }
    const guild = interaction.guild;

    // Define readable verification levels and explicit content filter levels
    const verificationLevels = {
      0: "None",
      1: "Low",
      2: "Medium",
      3: "High",
      4: "Very High",
    };

    const explicitContentFilterLevels = {
      0: "Disabled",
      1: "Members without roles",
      2: "All members",
    };

    // Creating an embed for server information
    const serverInfoEmbed = new EmbedBuilder()
      .setColor("#0099ff") // Color of the embed
      .setTitle(`${guild.name} Server Information`)
      .setThumbnail(guild.iconURL()) // Set server icon as thumbnail
      .addFields({ name: "Server Name", value: guild.name }, { name: "Region", value: guild.preferredLocale }, { name: "Member Count", value: `${guild.memberCount}` }, { name: "Created On", value: `${guild.createdAt.toDateString()}` }, { name: "Owner", value: `${guild.ownerId ? `<@${guild.ownerId}>` : "Unknown"}` }, { name: "Description", value: guild.description || "No description available." }, { name: "Verification Level", value: verificationLevels[guild.verificationLevel] }, { name: "Boost Level", value: guild.premiumTier.toString() }, { name: "Total Boosts", value: `${guild.premiumSubscriptionCount}` }, { name: "AFK Channel", value: guild.afkChannel ? guild.afkChannel.name : "None" }, { name: "AFK Timeout", value: `${guild.afkTimeout / 60} minutes` }, { name: "Explicit Content Filter", value: explicitContentFilterLevels[guild.explicitContentFilter] }, { name: "Roles Count", value: `${guild.roles.cache.size}` }, { name: "Emojis Count", value: `${guild.emojis.cache.size}` }, { name: "Stickers Count", value: `${guild.stickers.cache.size}` })
      .setFooter({ text: `ID: ${guild.id}` })
      .setTimestamp();

    return interaction.editReply({ embeds: [serverInfoEmbed] });
  },
};
