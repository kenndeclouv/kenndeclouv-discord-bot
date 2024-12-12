const { EmbedBuilder } = require("discord.js");
const User = require("../database/models/User"); // Model untuk mengambil data user dari database

// Fungsi untuk menghitung XP yang dibutuhkan untuk naik level
const levelUpXp = (level) => level * level * 100;

// Fungsi untuk menambahkan XP pada pengguna
const addXp = async (userId, xpToAdd, message) => {
  // Cek apakah user sudah ada di database
  let user = await User.findOne({ where: { userId } });

  if (!user) {
    return message.reply({
      content: "Kamu belum memiliki akun. Gunakan `/account create` untuk membuat akun.",
      ephemeral: true,
    });
  }

  // Tambahkan XP ke user
  user.xp += xpToAdd;

  // Hitung level baru
  const requiredXp = levelUpXp(user.level);
  if (user.xp >= requiredXp) {
    // Level up!
    user.level += 1;
    user.xp -= requiredXp; // Kurangi XP yang lebih

    // Kirim pesan level up di channel
    const levelUpEmbed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle("> Level Up!")
      .setDescription(`Selamat ${message.author}, kamu telah naik ke level **${user.level}**! 🎉`)
      .setThumbnail(message.author.displayAvatarURL())
      .setTimestamp()
      .setFooter({
        text: `Sistem level`,
        iconURL: message.guild.iconURL(),
      });
    await message.channel.send({ embeds: [levelUpEmbed] });
  }

  // Simpan data user ke database setelah update
  await user.update({ xp: user.xp, level: user.level });
};
const calculateLevel = (xp) => {
  return Math.floor(0.1 * Math.sqrt(xp));
};

module.exports = { addXp, levelUpXp, calculateLevel };

