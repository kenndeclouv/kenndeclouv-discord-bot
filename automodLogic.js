const { addXp } = require("./system/leveling");
const AutoMod = require("./database/models/automod");
require("dotenv").config();
const cooldown = new Set();
const xpPerMessage = parseInt(process.env.LEVELING_XP, 10) || 15;

module.exports = async (message) => {
  if (message.author.bot) return; // Abaikan pesan bot

  const guildId = message.guild.id;
  const autoModSettings = await AutoMod.findOne({ where: { guildId } });

  if (!autoModSettings) return; // Jika tidak ada pengaturan, keluar

  // Leveling
  if (autoModSettings.leveling || process.env.LEVELING_ON) {
    const channel = message.guild.channels.cache.get(
      process.env.LEVELING_CHANNEL
    );
    if (channel) {
      await addXp(message.author.id, xpPerMessage, message, channel);
      cooldown.add(message.author.id);

      setTimeout(() => {
        cooldown.delete(message.author.id);
      }, parseInt(process.env.LEVELING_COOLDOWN, 10) || 60000);
    }
  }
  // Deteksi kata kasar
  if (autoModSettings.antiBadwords || process.env.ANTI_BADWORDS_ON) {
    let badWords = autoModSettings.badwords;

    if (typeof badWords === "string") {
      try {
        badWords = JSON.parse(badWords);
      } catch (err) {
        console.error("❌ gagal parse badwords dari database:", err);
        badWords = [];
      }
    }

    if (!Array.isArray(badWords)) badWords = [];

    const regex = new RegExp(
      `\\b(${badWords.map((w) => w.toLowerCase()).join("|")})\\b`,
      "i"
    );

    if (regex.test(message.content.toLowerCase())) {
      await sendWarning(message, "Proteksi Anti-kata kasar");
      return message.delete();
    }
  }

  // Cek anti-invite
  if (
    autoModSettings.antiInvites ||
    (process.env.ANTI_INVITES_ON &&
      /discord\.gg|discord\.com\/invite/.test(message.content))
  ) {
    await sendWarning(message, "Proteksi Anti-invite"); // Kirim peringatan
    return message.delete(); // Hapus pesan yang mengandung invite
  }

  // Cek anti-links
  if (
    autoModSettings.antiLinks ||
    (process.env.ANTI_LINKS_ON && /https?:\/\/[^\s]+/.test(message.content))
  ) {
    await sendWarning(message, "Proteksi Anti-link"); // Kirim peringatan
    return message.delete(); // Hapus pesan yang mengandung link
  }

  // Cek anti-spam
  if (autoModSettings.antiSpam || process.env.ANTI_SPAM_ON) {
    const userMessages = message.channel.messages.cache.filter(
      (m) => m.author.id === message.author.id
    );

    if (userMessages.size > 5) {
      await sendWarning(message, "Proteksi Anti-spam"); // Kirim peringatan
      return message.delete(); // Hapus pesan jika spam
    }
  }

  // Cek whitelist
  if (autoModSettings.whitelist.includes(message.author.id)) return; // Jika user ada di whitelist, keluar
  if (message.mentions.roles.size > 0) {
    for (const role of message.mentions.roles.values()) {
      if (autoModSettings.whitelist.includes(role.id)) return; // Jika role ada di whitelist, keluar
    }
  }
};

// Fungsi untuk mengirim pesan peringatan
const sendWarning = async (message, reason) => {
  const warningMessage = `🚫 **Peringatan!** Pesan yang kamu kirim dihapus karena **${reason}**.`;
  const warning = await message.channel.send(warningMessage);
  setTimeout(() => warning.delete(), 10000); // Hapus pesan peringatan setelah 10 detik
};
