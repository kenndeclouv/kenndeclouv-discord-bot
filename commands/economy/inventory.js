const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const User = require("../../database/models/User");
const Inventory = require("../../database/models/inventory");

module.exports = {
  data: new SlashCommandBuilder().setName("inventory").setDescription("Lihat semua item di inventaris kamu."),
  async execute(interaction) {
    const user = await User.findOne({ where: { userId: interaction.user.id } });
    if (!user) {
      return interaction.reply({ content: "kamu belum memiliki akun gunakan `/account create` untuk membuat akun.", ephemeral: true });
    }

    const inventoryItems = await Inventory.findAll({ where: { userId: user.userId } });

    if (inventoryItems.length === 0) {
      return interaction.reply({ content: "Inventaris kamu kosong.", ephemeral: true });
    }

    const itemCounts = inventoryItems.reduce((acc, item) => {
      acc[item.itemName] = (acc[item.itemName] || 0) + 1;
      return acc;
    }, {});

    const embed = new EmbedBuilder()
      .setColor("Blue")
      .setTitle("> Inventaris kamu")
      .setDescription("Item yang kamu miliki:")
      .setTimestamp()
      .setFooter({ text: `Diminta oleh ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });

    Object.entries(itemCounts).forEach(([itemName, count]) => {
      embed.addFields({ name: `${itemName} (${count})`, value: `kamu memiliki item ini sebanyak ${count} barang`, inline: true });
    });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
