const { addXp } = require("./system/leveling");
const AutoMod = require("./database/models/automod");
require("dotenv").config();

const cooldown = new Set();
const spamCache = new Map(); // cache anti-spam

const xpPerMessage = parseInt(process.env.LEVELING_XP, 10) || 15;
const modLogChannelId = process.env.MOD_LOG_CHANNEL; // <- pasang di .env

module.exports = async (message) => {
  if (message.author.bot) return;

  const guildId = message.guild.id;
  const userId = message.author.id;

  const autoModSettings = await AutoMod.findOne({ where: { guildId } });
  if (!autoModSettings) return;

  // ⛔ WHITELIST DIAWAL
  if (Array.isArray(autoModSettings.whitelist)) {
    if (autoModSettings.whitelist.includes(userId)) return;
    if (
      message.mentions.roles.size > 0 &&
      [...message.mentions.roles.values()].some((r) =>
        autoModSettings.whitelist.includes(r.id)
      )
    )
      return;
  }

  // 🎯 LEVELING
  if (autoModSettings.leveling || process.env.LEVELING_ON) {
    const channel = message.guild.channels.cache.get(
      process.env.LEVELING_CHANNEL
    );
    if (channel && !cooldown.has(userId)) {
      await addXp(userId, xpPerMessage, message, channel);
      cooldown.add(userId);
      setTimeout(
        () => cooldown.delete(userId),
        parseInt(process.env.LEVELING_COOLDOWN) || 60000
      );
    }
  }

  // 🤬 BADWORDS
  if (autoModSettings.antiBadwords || process.env.ANTI_BADWORDS_ON) {
    let badWords = autoModSettings.badwords;

    if (typeof badWords === "string") {
      try {
        badWords = JSON.parse(badWords);
      } catch (e) {
        console.error("❌ gagal parse badWords, reset ke array kosong");
        badWords = [];
      }
    }

    if (Array.isArray(badWords) && badWords.length > 0) {
      const escapedWords = badWords.map((w) =>
        w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      );
      const regex = new RegExp(`\\b(${escapedWords.join("|")})\\b`, "i");

      if (regex.test(message.content.toLowerCase())) {
        await sendWarning(message, "Proteksi Anti-kata kasar", message.content);
        return message.delete();
      }
    }
  }

  // 🧨 INVITES
  if (
    autoModSettings.antiInvites ||
    (process.env.ANTI_INVITES_ON &&
      /discord\.gg|discord\.com\/invite/.test(message.content))
  ) {
    await sendWarning(message, "Proteksi Anti-invite", message.content);
    return message.delete();
  }

  // 🌐 LINKS
  if (
    autoModSettings.antiLinks ||
    (process.env.ANTI_LINKS_ON && /https?:\/\/[^\s]+/.test(message.content))
  ) {
    await sendWarning(message, "Proteksi Anti-link", message.content);
    return message.delete();
  }

  // 📛 SPAM
  if (autoModSettings.antiSpam || process.env.ANTI_SPAM_ON) {
    const now = Date.now();
    const windowMs = 5000;
    const maxMessages = parseInt(process.env.ANTI_SPAM_MAX, 10) || 5;

    let timestamps = spamCache.get(userId) || [];
    timestamps = timestamps.filter((ts) => now - ts < windowMs);
    timestamps.push(now);
    spamCache.set(userId, timestamps);

    if (timestamps.length > maxMessages) {
      await sendWarning(message, "Proteksi Anti-spam", message.content);
      return message.delete();
    }
  }
};

// 🚨 fungsi kirim warning + log ke channel log
const sendWarning = async (message, reason, originalContent = null) => {
  const warningMessage = `🚫 **Peringatan!** Pesan kamu dihapus karena **${reason}**.`;
  const warning = await message.channel.send(warningMessage);
  setTimeout(() => warning.delete(), 10000);

  // 🔐 kirim log ke channel log
  const logChannel = message.guild.channels.cache.get(
    process.env.MOD_LOG_CHANNEL
  );
  if (logChannel) {
    const embed = {
      color: 0xff0000,
      title: "🚨 Automod Log",
      fields: [
        { name: "User", value: `<@${message.author.id}>`, inline: true },
        { name: "Alasan", value: reason, inline: true },
        { name: "Channel", value: `<#${message.channel.id}>`, inline: true },
        {
          name: "Isi Pesan",
          value: originalContent?.slice(0, 1000) || "(tidak tersedia)",
        },
      ],
      timestamp: new Date(),
    };

    logChannel.send({ embeds: [embed] }).catch(console.error);
  }
};