const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('info')
    .setDescription('Lihat semua perintah ekonomi yang bisa dipakai.'),
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor("Blue")
      .setTitle("> Daftar Perintah Ekonomi")
      .setDescription("Yuk, cek semua perintah ekonomi yang bisa kamu pakai dan deskripsi singkatnya:")
      .addFields(
        { name: '``/account create``', value: 'Bikin akun baru buat kamu.'},
        { name: '``/account edit``', value: 'Ubah info akun kamu.'},
        { name: '``/work``', value: 'Kerja biar dapat uang.'},
        { name: '``/withdraw``', value: 'Ambil uang tunai dari bank kamu.'},
        { name: '``/lootbox``', value: 'Buka kotak hadiah buat dapat hadiah acak.'},
        { name: '``/slots``', value: 'Main slot machine, siapa tahu beruntung.'},
        { name: '``/rob``', value: 'Coba ambil uang dari orang lain.'},
        { name: '``/bank``', value: 'Cek saldo bank kamu.'},
        { name: '``/beg``', value: 'Minta uang dari orang lain.'},
        { name: '``/coinflip``', value: 'Taruhan lempar koin.'},
        { name: '``/daily``', value: 'Ambil hadiah harian kamu.'},
        { name: '``/deposit``', value: 'Simpan uang tunai ke bank kamu.'},
        { name: '``/transfer``', value: 'Kirim uang ke orang lain.'},
        { name: '``/give``', value: 'Kasih uang ke orang lain.'},
        { name: '``/cash``', value: 'Lihat berapa uang tunai yang kamu punya.' }
      )
      .setTimestamp()
      .setFooter({ text: `Diminta oleh ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
