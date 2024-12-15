const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const User = require("../../database/models/User");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("squad")
    .setDescription("Bergabung ke squad.")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("war")
        .setDescription("Squad yang sedang bermain.")
        .addStringOption((option) => option.setName("time").setDescription("Pilih waktu dalam detik.").setRequired(true))
        .addStringOption((option) => option.setName("reward_type").setDescription("Pilih jenis reward.").setRequired(true).addChoices({ name: "Uang", value: "money" }, { name: "XP", value: "xp" }))
        .addIntegerOption((option) => option.setName("reward_amount").setDescription("Pilih jumlah reward.").setRequired(true))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("join")
        .setDescription("Bergabung ke squad.")
        .addStringOption((option) => option.setName("role").setDescription("Pilih squad yang ingin kamu ikuti.").setRequired(true).addChoices({ name: "Squad Merah", value: "merah" }, { name: "Squad Biru", value: "biru" }))
    )
    .addSubcommand((subcommand) => subcommand.setName("leave").setDescription("Keluar dari squad.")),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "join") {
      await interaction.deferReply({ ephemeral: true });
      const squad = interaction.options.getString("role");
      const memberId = interaction.user.id;
      const member = interaction.guild.members.cache.get(memberId);

      try {
        const roleName = squad === "merah" ? "Squad Merah" : "Squad Biru";
        const role = interaction.guild.roles.cache.find((role) => role.name === roleName);

        if (!role) return interaction.editReply("Role tidak ditemukan.");

        await member.roles.add(role);
        await interaction.editReply(`Selamat datang di ${roleName}, ${interaction.user.username}!`);
      } catch (error) {
        console.error(error);
        return interaction.editReply("Terjadi kesalahan saat menambahkan role.");
      }
    }

    if (subcommand === "leave") {
      await interaction.deferReply({ ephemeral: true });
      const memberId = interaction.user.id;
      const member = interaction.guild.members.cache.get(memberId);
      const roles = member.roles.cache.filter((role) => role.name.includes("Squad"));

      roles.forEach((role) => {
        member.roles.remove(role);
      });

      await interaction.editReply("Kamu telah keluar dari squad.");
    }

    if (subcommand === "war") {
      try {
        const time = interaction.options.getString("time");
        const rewardType = interaction.options.getString("reward_type");
        const rewardAmount = interaction.options.getInteger("reward_amount");

        const duration = parseDuration(time);
        const endTime = Date.now() + duration;

        const embed = new EmbedBuilder()
          .setTitle("🔴 Squad War! 🔵")
          .setDescription("Pilih squad yang kamu dukung! React dengan 🔴 untuk Squad Merah atau 🔵 untuk Squad Biru!")
          .addFields({ name: "Hadiah untuk squad yang menang", value: `${rewardAmount} ${rewardType === "money" ? "Uang" : "XP"}` })
          .setColor(0xf7f7f7)
          .setThumbnail(interaction.client.user.displayAvatarURL())
          .setFooter({ text: `Berakhir pada: ${new Date(endTime).toLocaleString()}` });

        const message = await interaction.reply({ embeds: [embed], fetchReply: true });

        await message.react("🔴");
        await message.react("🔵");

        const filter = (reaction, user) => {
          if (!["🔴", "🔵"].includes(reaction.emoji.name) || user.bot) return false;

          const userReactions = reaction.message.reactions.cache.filter((r) => r.users.cache.has(user.id));

          // Hapus reaksi yang sudah ada jika user reaksi lebih dari satu
          if (userReactions.size > 1) {
            userReactions.forEach((r) => {
              if (r.emoji.name !== reaction.emoji.name) {
                r.users.remove(user.id); // hapus reaction lain
              }
            });
          }
          return true;
        };

        const collector = message.createReactionCollector({ filter, time: duration });

        const interval = setInterval(() => {
          const timeLeft = endTime - Date.now();
          if (timeLeft <= 0) {
            clearInterval(interval);
            endSquadWar(interaction, message, rewardAmount, rewardType); // kirim message
          } else {
            const secondsLeft = Math.round(timeLeft / 1000);
            const minutesLeft = Math.floor(secondsLeft / 60);
            const hoursLeft = Math.floor(minutesLeft / 60);
            const displaySeconds = secondsLeft % 60;
            const displayMinutes = minutesLeft % 60;
            const displayHours = hoursLeft % 24;
            const displayDays = Math.floor(hoursLeft / 24);
            const displayWeeks = Math.floor(displayDays / 7);

            const timeString = [displayWeeks ? `${displayWeeks} minggu` : "", displayDays ? `${displayDays} hari` : "", displayHours ? `${displayHours} jam` : "", displayMinutes ? `${displayMinutes} menit` : "", displaySeconds ? `${displaySeconds} detik` : ""].filter(Boolean).join(", ");

            embed.setDescription(`Pilih squad yang kamu dukung! React dengan 🔴 untuk Squad Merah atau 🔵 untuk Squad Biru!\n\n**Waktu tersisa: ${timeString}**`);

            // cek apakah message masih ada
            if (!message || message.deleted) {
              clearInterval(interval); // stop interval kalau message dihapus
              return;
            }

            message.edit({ embeds: [embed] }).catch((err) => {
              console.error("Gagal mengedit message:", err);
              clearInterval(interval); // stop interval kalau terjadi error
            });
          }
        }, 1000);
      } catch (error) {
        console.error(error);
        return interaction.editReply("Terjadi kesalahan saat menjalankan perang.");
      }
    }
  },
};

function parseDuration(duration) {
  const timeUnitRegex = /(\d+)([smhwd])/g;
  let totalMilliseconds = 0;
  let match;

  while ((match = timeUnitRegex.exec(duration)) !== null) {
    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case "s":
        totalMilliseconds += value * 1000;
        break;
      case "m":
        totalMilliseconds += value * 60 * 1000;
        break;
      case "h":
        totalMilliseconds += value * 60 * 60 * 1000;
        break;
      case "d":
        totalMilliseconds += value * 24 * 60 * 60 * 1000;
        break;
      case "w":
        totalMilliseconds += value * 7 * 24 * 60 * 60 * 1000;
        break;
    }
  }

  return totalMilliseconds;
}

async function endSquadWar(interaction, message, rewardAmount, rewardType) {
  try {
    // validasi pesan sebelum akses reactions
    if (!message || message.deleted) {
      console.error("Pesan sudah dihapus atau tidak ditemukan.");
      return interaction.channel.send("⚠️ Perang sudah selesai, tapi pesan utama hilang.");
    }

    const redReaction = message.reactions.cache.get("🔴");
    const blueReaction = message.reactions.cache.get("🔵");

    const redCount = redReaction ? redReaction.count - 1 : 0;
    const blueCount = blueReaction ? blueReaction.count - 1 : 0;

    const winner = redCount > blueCount ? "Squad Merah" : blueCount > redCount ? "Squad Biru" : "Tidak ada, seri!";

    const embed = new EmbedBuilder()
      .setTitle("🔴 Squad War Ended! 🔵")
      .setColor("Green")
      .setThumbnail(interaction.client.user.displayAvatarURL())
      .setDescription(`Perang selesai! pemenang **${winner}**, ${winner != "Tidak ada, seri!" ? "NT buat yang kalahh" : ""}\n\n🔴 Squad Merah: ${redCount} votes\n🔵 Squad Biru: ${blueCount} votes`)
      .setFooter({ text: `Sistem`, iconURL: interaction.client.user.displayAvatarURL() });

    if (winner !== "Tidak ada, seri!") {
      embed.addFields({
        name: "Hadiah",
        value: `${rewardAmount} ${rewardType === "money" ? "Uang" : "XP"} diberikan ke pemenang!`,
      });
    }

    // update pesan dengan embed hasil akhir
    await message.edit({ embeds: [embed] });

    // kirim hadiah jika ada pemenang
    if (winner === "Squad Merah" || winner === "Squad Biru") {
      const winnerRole = winner === "Squad Merah" ? "Squad Merah" : "Squad Biru";
      const winnerMembers = interaction.guild.members.cache.filter((member) => member.roles.cache.some((role) => role.name === winnerRole));

      for (const member of winnerMembers.values()) {
        try {
          const user = await User.findOne({ where: { userId: member.id } });
          if (!user) continue;

          if (rewardType === "money") user.cash += rewardAmount;
          else if (rewardType === "xp") user.xp += rewardAmount;

          await user.save();
        } catch (error) {
          console.error(`Gagal memberikan reward kepada user ${member.id}: ${error.message}`);
        }
      }
    }
  } catch (error) {
    console.error("Error di endSquadWar:", error);
    interaction.channel.send("⚠️ Terjadi masalah saat menyelesaikan perang.");
  }
}
