const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const User = require("../../database/models/User");
const Inventory = require("../../database/models/inventory");

module.exports = {
  data: new SlashCommandBuilder().setName("inventory").setDescription("Lihat semua item di inventaris kamu."),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    try {
      const user = await User.findOne({ where: { userId: interaction.user.id } });
      if (!user) {
        return interaction.editReply({ content: "kamu belum memiliki akun gunakan `/account create` untuk membuat akun." });
      }

      const inventoryItems = await Inventory.findAll({ where: { userId: user.userId } });

      if (inventoryItems.length === 0) {
        return interaction.editReply({ content: "Inventaris kamu kosong." });
      }

      const itemCounts = inventoryItems.reduce((acc, item) => {
        acc[item.itemName] = (acc[item.itemName] || 0) + 1;
        return acc;
      }, {});

      const embed = new EmbedBuilder().setColor("Blue").setTitle("> Inventaris kamu").setDescription("Item yang kamu miliki:").setTimestamp().setFooter({ text: `Sistem`, iconURL: interaction.client.user.displayAvatarURL() });

      Object.entries(itemCounts).forEach(([itemName, count]) => {
        embed.addFields({ name: `${itemName} (${count})`, value: `kamu memiliki item ini sebanyak ${count} barang`, inline: true });
      });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error("Error during inventory command execution:", error);
      return interaction.editReply({ content: "❌ Terjadi kesalahan saat menjalankan perintah ini. Silakan coba lagi." });
    }
  },
};
