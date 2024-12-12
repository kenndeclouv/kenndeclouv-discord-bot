const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require("discord.js");
const User = require("../../database/models/User");
const Inventory = require("../../database/models/inventory");

module.exports = {
  data: new SlashCommandBuilder().setName("shop").setDescription("Lihat dan beli item dari toko."),
  async execute(interaction) {
    const user = await User.findOne({ where: { userId: interaction.user.id } });
    if (!user) {
      return interaction.reply({ content: "kamu belum memiliki akun gunakan `/account create` untuk membuat akun.", ephemeral: true });
    }

    const items = [
      { name: "🧪 Poison", price: 150, description: "Poison yang dapat meracuni musuh jika anda dicuri." },
      { name: "🛡️ Shield", price: 100, description: "Perisai yang kokoh untuk melindungi diri dari pencuri." },
      { name: "⚔️ Sword", price: 150, description: "Pedang yang kuat untuk bertarung melawan pencuri." },
    ];

    const embed = new EmbedBuilder()
      .setColor("Blue")
      .setTitle("> Toko")
      .setDescription("Selamat datang di toko! Pilih item yang ingin kamu beli:")
      .setTimestamp()
      .setFooter({ text: `Diminta oleh ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });

    items.forEach((item) => {
      embed.addFields({ name: `${item.name}`, value: `Harga: **${item.price}** uang\n${item.description}`, inline: true });
    });

    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("select_item")
        .setPlaceholder("Pilih item untuk dibeli")
        .addOptions(
          items.map((item) => ({
            label: item.name,
            description: `Harga: ${item.price} uang`,
            value: item.name.toLowerCase(),
          }))
        )
    );

    await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });

    const filter = (i) => i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

    collector.on("collect", async (i) => {
      if (i.customId === "select_item") {
        await i.deferUpdate();
        const selectedItem = items.find((item) => item.name.toLowerCase() === i.values[0]);

        if (!selectedItem) return;

        if (user.cash < selectedItem.price) {
          await interaction.editReply({
            content: "kamu tidak memiliki uang yang cukup untuk membeli item ini.",
            embeds: [], // hapus embed
            components: [],
          });
          return;
        }

        const confirmRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId("confirm_purchase").setLabel("Konfirmasi Pembelian").setStyle(ButtonStyle.Success),
          new ButtonBuilder().setCustomId("cancel_purchase").setLabel("Batal").setStyle(ButtonStyle.Danger)
        );

        await interaction.editReply({
          content: `kamu akan membeli **${selectedItem.name}** seharga **${selectedItem.price} uang**. Konfirmasi pembelian?`,
          embeds: [], // hapus embed
          components: [confirmRow],
        });

        const confirmationFilter = (btn) => btn.user.id === interaction.user.id;
        const confirmationCollector = interaction.channel.createMessageComponentCollector({ filter: confirmationFilter, time: 15000, max: 1 });

        confirmationCollector.on("collect", async (btn) => {
          await btn.deferUpdate();
          if (btn.customId === "confirm_purchase") {
            user.cash -= selectedItem.price;
            await user.save();

            await Inventory.create({
              userId: user.userId,
              itemName: selectedItem.name,
            });

            await interaction.editReply({
              content: `kamu berhasil membeli **${selectedItem.name}**!`,
              embeds: [], // hapus embed
              components: [],
            });
          } else if (btn.customId === "cancel_purchase") {
            await interaction.editReply({
              content: "Pembelian dibatalkan.",
              embeds: [], // hapus embed
              components: [],
            });
          }
        });

        confirmationCollector.on("end", () => {
          interaction.editReply({
            components: [],
          });
        });
      }
    });

    collector.on("end", () => {
      interaction.editReply({
        content: "Waktu habis. Silakan gunakan kembali perintah `/shop` untuk mengakses toko.",
        embeds: [], // hapus embed
        components: [],
      });
    });
  },
};
