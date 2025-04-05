const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const User = require("../../database/models/User");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("deposit")
    .setDescription("Simpan uang tunai kamu ke bank.")
    .addStringOption((option) => option.setName("type").setDescription("Pilih jenis setor: semua atau sebagian").setRequired(true).addChoices({ name: "Setor Semua", value: "all" }, { name: "Setor Sebagian", value: "partial" }))
    .addIntegerOption(
      (option) => option.setName("amount").setDescription("Jumlah untuk menyimpan").setRequired(false).setMinValue(1) // buat batas minimum jumlah setor
    ),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    try {
      const type = interaction.options.getString("type");
      let amount = interaction.options.getInteger("amount");
      const user = await User.findOne({ where: { userId: interaction.user.id } });

      if (!user) {
        return interaction.editReply({ content: "Pengguna tidak ditemukan." });
      }

      if (type === "all") {
        amount = user.cash;
      } else if (type === "partial") {
        if (amount === null) {
          return interaction.editReply({ content: "Jumlah untuk menyimpan harus diisi." });
        }
      }

      if (user.cash < amount) {
        return interaction.editReply({ content: "Kamu tidak memiliki uang tunai yang cukup untuk menyimpan." });
      }

      user.cash -= amount;
      user.bank += amount;
      await user.save();

      const embed = new EmbedBuilder().setColor("Green").setTitle("> Hasil Menyimpan Uang").setThumbnail(interaction.user.displayAvatarURL()).setDescription(`Kamu menyimpan **${amount} uang** ke bank!`).setTimestamp().setFooter({ text: `Sistem`, iconURL: interaction.client.user.displayAvatarURL() });

      return interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error("Error during deposit command execution:", error);
      return interaction.editReply({ content: "❌ Terjadi kesalahan saat menjalankan perintah ini. Silakan coba lagi." });
    }
  },
};

