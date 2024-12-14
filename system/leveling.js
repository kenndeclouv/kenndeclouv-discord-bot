const { EmbedBuilder } = require("discord.js");
const User = require("../database/models/User");
const config = require("../config"); // Import config untuk roleReward

// Fungsi untuk menghitung XP yang dibutuhkan untuk naik level
const levelUpXp = (level) => level * level * 100;

// Fungsi untuk menambahkan XP pada pengguna
const addXp = async (userId, xpToAdd, message, channel) => {
  // Cek apakah user sudah ada di database
  let user = await User.findOne({ where: { userId } });
  if (!user) {
    return console.log("User not found");
  }

  // Tambahkan XP ke user
  user.xp += xpToAdd;

  // Hitung level baru
  const requiredXp = levelUpXp(user.level);
  if (user.xp >= requiredXp) {
    // Level up!
    user.level += 1;
    user.xp -= requiredXp; // Kurangi XP yang lebih

    // Cek apakah ada role reward untuk level baru
    const reward = config.cooldowns.roleReward.find((r) => r.level === user.level);
    if (reward) {
      const role = message.guild.roles.cache.get(reward.role);
      const member = message.guild.members.cache.get(userId);

      if (role && member) {
        await member.roles.add(role);
        const roleRewardEmbed = new EmbedBuilder().setColor(0x1e90ff).setTitle("> Role Reward!").setDescription(`Selamat ${message.author}, kamu telah mendapatkan role **${role.name}** karena mencapai level **${user.level}**! 🏅`).setThumbnail(message.author.displayAvatarURL()).setTimestamp().setFooter({
          text: `Sistem level`,
          iconURL: message.client.user.displayAvatarURL(),
        });

        await channel.send({ embeds: [roleRewardEmbed] });
      }
    }

    // Kirim pesan level up di channel
    const levelUpEmbed = new EmbedBuilder().setColor("Green").setTitle("> Level Up!").setDescription(`selamatt ${message.author}!, kamu telah naik ke level **${user.level}**! 🎉`).setThumbnail(message.author.displayAvatarURL()).setTimestamp().setFooter({ text: `Sistem level`, iconURL: message.client.user.displayAvatarURL() });
    await channel.send({ embeds: [levelUpEmbed] });
  }

  // Simpan data user ke database setelah update
  await user.update({ xp: user.xp, level: user.level });
};

const calculateLevel = (xp) => {
  return Math.floor(0.1 * Math.sqrt(xp));
};

module.exports = { addXp, levelUpXp, calculateLevel };
