const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const Giveaway = require("../../database/models/Giveaway");
const User = require("../../database/models/User");
const checkPermission = require("../../helpers/checkPermission");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("giveaway")
    .setDescription("Kelola giveaway")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("start")
        .setDescription("Mulai giveaway")
        .addStringOption((option) => option.setName("type").setDescription("Tipe giveaway").setRequired(true).addChoices({ name: "Uang", value: "money" }, { name: "Lainnya", value: "another" }))
        .addStringOption((option) => option.setName("duration").setDescription("Durasi (mis. 10s, 1m, 2h, 1d, 1w)").setRequired(true))
        .addIntegerOption((option) => option.setName("winners").setDescription("Jumlah pemenang").setRequired(true))
        .addStringOption((option) => option.setName("prize").setDescription("Hadiah untuk giveaway").setRequired(true))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("end")
        .setDescription("Akhiri giveaway")
        .addStringOption((option) => option.setName("message_id").setDescription("ID pesan dari giveaway").setRequired(true))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("cancel")
        .setDescription("Batalkan giveaway")
        .addStringOption((option) => option.setName("message_id").setDescription("ID pesan dari giveaway").setRequired(true))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("drop")
        .setDescription("Drop giveaway di channel")
        .addIntegerOption((option) => option.setName("winners").setDescription("Jumlah pemenang").setRequired(true))
        .addStringOption((option) => option.setName("prize").setDescription("Hadiah untuk giveaway").setRequired(true))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("edit")
        .setDescription("Edit giveaway")
        .addStringOption((option) => option.setName("message_id").setDescription("ID pesan dari giveaway").setRequired(true))
        .addStringOption((option) => option.setName("duration").setDescription("Durasi baru (mis. 10s, 1m, 2h)").setRequired(false))
        .addIntegerOption((option) => option.setName("winners").setDescription("Jumlah pemenang baru").setRequired(false))
        .addStringOption((option) => option.setName("prize").setDescription("Hadiah baru untuk giveaway").setRequired(false))
    ),

  adminOnly: true,
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    if (!checkPermission(interaction.member)) {
      return interaction.reply({ content: "❌ Kamu tidak punya izin untuk menggunakan perintah ini.", ephemeral: true });
    }

    switch (subcommand) {
      case "start":
        await startGiveaway(interaction);
        break;
      case "end":
        await endGiveaway(interaction);
        break;
      case "cancel":
        await cancelGiveaway(interaction);
        break;
      case "drop":
        await dropGiveaway(interaction);
        break;
      case "edit":
        await editGiveaway(interaction);
        break;
      default:
        await interaction.reply("Subcommand tidak dikenal.");
    }
  },
};

// Fungsi untuk mengonversi durasi ke milidetik
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

// Fungsi untuk memulai giveaway
async function startGiveaway(interaction) {
  // cek izin
  // const { PermissionsBitField } = require('discord.js');
  if (!interaction.member.permissions.has(PermissionsBitField.Flags.SendMessages)) {
    return interaction.reply({
      content: "kamu tidak memiliki izin untuk mengirim pesan.",
      ephemeral: true,
    });
  }
  const durationInput = interaction.options.getString("duration");
  const winners = interaction.options.getInteger("winners");
  const prize = interaction.options.getString("prize");
  const type = interaction.options.getString("type");

  const duration = parseDuration(durationInput);
  if (duration <= 0) {
    return interaction.reply("Durasi yang ditentukan tidak valid.");
  }

  const endTime = Date.now() + duration;

  const embed = new EmbedBuilder()
    .setTitle("🎉 Giveaway! 🎉")
    .setDescription(`Hadiah: ${prize}\nPemenang: ${winners}\nBerakhir dalam: ${durationInput}\nReact dengan 🎉 untuk ikut!`)
    .setColor("Random")
    .setThumbnail(interaction.client.user.displayAvatarURL())
    .setImage("https://i.ibb.co.com/Y0C1Zcw/tenor.gif")
    .setFooter({ text: `Berakhir pada: ${new Date(endTime).toLocaleString()}` });

  const message = await interaction.channel.send({ embeds: [embed] });
  await message.react("🎉");

  // Simpan giveaway ke database
  const giveaway = await Giveaway.create({
    messageId: message.id,
    channelId: interaction.channel.id,
    guildId: interaction.guild.id,
    type: type,
    duration: duration,
    winners: winners,
    prize: prize,
    participants: JSON.stringify([]), // Inisialisasi sebagai string JSON kosong
    ended: false,
  });

  const filter = (reaction, user) => {
    return reaction.emoji.name === "🎉" && !user.bot;
  };

  const collector = message.createReactionCollector({
    filter,
    time: duration,
  });

  // Fungsi untuk menambahkan ID user
  collector.on("collect", async (reaction, user) => {
    // Pastikan participants adalah array
    if (!Array.isArray(giveaway.participants)) {
      giveaway.participants = JSON.parse(giveaway.participants || "[]"); // Jika participants adalah string, parse jadi array
    }

    if (!giveaway.participants.includes(user.id)) {
      // Menambahkan user.id ke array participants jika belum ada
      giveaway.participants.push(user.id);
      // Simpan perubahan pada database
      giveaway.participants = JSON.stringify(giveaway.participants); // Simpan kembali sebagai string jika diperlukan
      await giveaway.save();
    }
  });

  // Fungsi untuk menghapus ID user
  collector.on("remove", async (reaction, user) => {
    if (!Array.isArray(giveaway.participants)) {
      giveaway.participants = JSON.parse(giveaway.participants || "[]"); // Pastikan participants adalah array
    }

    const index = giveaway.participants.indexOf(user.id);
    if (index > -1) {
      // Hapus ID dari array participants
      giveaway.participants.splice(index, 1);
      // Simpan perubahan pada database
      giveaway.participants = JSON.stringify(giveaway.participants); // Simpan kembali sebagai string jika diperlukan
      await giveaway.save();
    }
  });

  const interval = setInterval(async () => {
    const timeLeft = endTime - Date.now();
    if (timeLeft <= 0) {
      clearInterval(interval);
      await endGiveawayById(message.id, interaction.guild, interaction);
    } else {
      const secondsLeft = Math.round(timeLeft / 1000);
      embed.setDescription(`Hadiah: ${prize}\nPemenang: ${winners}\nBerakhir dalam: ${secondsLeft}s\nReact dengan 🎉 untuk ikut!`);
      await message.edit({ embeds: [embed] });
    }
  }, 1000);

  await interaction.reply(`Giveaway dimulai! Akan berakhir dalam ${durationInput}.`);
}

// Fungsi untuk mengakhiri giveaway
async function endGiveaway(interaction) {
  const messageId = interaction.options.getString("message_id");
  const giveaway = await Giveaway.findOne({ where: { messageId } });

  if (!giveaway || giveaway.ended) {
    return interaction.reply("Giveaway tidak ditemukan atau sudah berakhir.");
  }

  await endGiveawayById(messageId, interaction.guild, interaction);
  await interaction.reply("Giveaway telah berakhir.");
}

// Fungsi untuk membatalkan giveaway
async function cancelGiveaway(interaction) {
  const messageId = interaction.options.getString("message_id");
  const giveaway = await Giveaway.findOne({ where: { messageId } });

  if (!giveaway) {
    return interaction.reply("Giveaway tidak ditemukan.");
  }

  const channel = await interaction.guild.channels.fetch(giveaway.channelId);
  const message = await channel.messages.fetch(messageId);

  await message.delete();
  await giveaway.destroy(); // Hapus dari DB

  await interaction.reply("Giveaway telah dibatalkan.");
}

// Fungsi untuk drop giveaway
async function dropGiveaway(interaction) {
  const winners = interaction.options.getInteger("winners");
  const prize = interaction.options.getString("prize");

  const embed = new EmbedBuilder().setTitle("🎉 Giveaway Drop! 🎉").setDescription(`Hadiah: ${prize}\nPemenang: ${winners}\nReact dengan 🎉 untuk ikut!`);

  const message = await interaction.channel.send({ embeds: [embed] });
  await message.react("🎉");

  await Giveaway.create({
    messageId: message.id,
    channelId: interaction.channel.id,
    guildId: interaction.guild.id,
    duration: 0, // Tidak ada durasi untuk drop
    winners: winners,
    prize: prize,
    participants: [],
    ended: false,
  });

  await interaction.reply(`Giveaway drop!`);
}

// Fungsi untuk mengedit giveaway
async function editGiveaway(interaction) {
  const messageId = interaction.options.getString("message_id");
  const durationInput = interaction.options.getString("duration");
  const winners = interaction.options.getInteger("winners");
  const prize = interaction.options.getString("prize");

  const giveaway = await Giveaway.findOne({ where: { messageId } });

  if (!giveaway) {
    return interaction.reply("Giveaway tidak ditemukan.");
  }

  if (durationInput) {
    const duration = parseDuration(durationInput);
    giveaway.duration = duration;
  }

  if (winners) {
    giveaway.winners = winners;
  }

  if (prize) {
    giveaway.prize = prize;
  }

  await giveaway.save();
  await interaction.reply("Giveaway telah diedit.");
}

async function endGiveawayById(messageId, guild, interaction) {
  const giveaway = await Giveaway.findOne({ where: { messageId } });

  if (!giveaway || giveaway.ended) return;

  const channel = await guild.channels.fetch(giveaway.channelId);
  const message = await channel.messages.fetch(messageId);

  // Parse participants string to actual array
  const participants = JSON.parse(giveaway.participants);
  // Jika data participant kosong, beri pesan dan hentikan (check for empty array)
  if (participants === "[]") {
    const noParticipantsEmbed = new EmbedBuilder()
      .setTitle("> Giveaway Berakhir! ")
      .setDescription("Tidak ada peserta yang mengikuti giveaway.")
      .setColor("Red")
      .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
      .setImage("https://i.ibb.co.com/Y0C1Zcw/tenor.gif")
      .setTimestamp()
      .setFooter({ text: "Sistem", iconURL: interaction.client.user.displayAvatarURL() });
    await message.channel.send({ embeds: [noParticipantsEmbed] });
    giveaway.ended = true;
    await giveaway.save();
    return;
  }

  const winners = [];
  for (let i = 0; i < giveaway.winners; i++) {
    const winnerId = getRandomIdFromJson(participants);
    winners.push(winnerId);
  }
  // Mapping winners to usernames
  const winnerUsernames = await Promise.all(
    winners.map(async (id) => {
      try {
        const user = await guild.members.fetch(id);
        return user ? `<@${user.id}>` : `Pengguna tidak ditemukan (${id})`;
      } catch (error) {
        console.error("Error fetching user:", error);
        return `Error fetching user (${id})`;
      }
    })
  );

  if (giveaway.type === "money") {
    const money = parseInt(giveaway.prize);
    for (let i = 0; i < winners.length; i++) {
      const winner = await guild.members.fetch(winners[i]);
      let user = await User.findOne({ where: { userId: winner.id } });
      user.cash += money;
      await user.save();

      const embed = new EmbedBuilder()
        .setTitle("> Giveaway Berakhir! ")
        .setDescription(`Kamu mendapatkan ${money} dari giveaway!`)
        .setColor("Green")
        .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
        .setImage("https://i.ibb.co.com/Y0C1Zcw/tenor.gif")
        .setTimestamp()
        .setFooter({ text: "Sistem", iconURL: interaction.client.user.displayAvatarURL() });
      await winner.send({ embeds: [embed] });
    }

    const winnerEmbed = new EmbedBuilder()
      .setTitle("> Giveaway Berakhir! ")
      .setDescription(`Hadiah: ${giveaway.prize}\nPemenang: ${winnerUsernames.join(", ")}`)
      .setColor("Green")
      .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
      .setImage("https://i.ibb.co.com/Y0C1Zcw/tenor.gif")
      .setTimestamp()
      .setFooter({ text: "Sistem", iconURL: interaction.client.user.displayAvatarURL() });

    await message.channel.send({ embeds: [winnerEmbed] });

    giveaway.ended = true;
    await giveaway.save();
  } else {
    // Siapkan pesan embed pemenang
    const winnerEmbed = new EmbedBuilder()
      .setTitle("> Giveaway Berakhir! ")
      .setDescription(`Hadiah: ${giveaway.prize}\nPemenang: ${winnerUsernames.join(", ")}`)
      .setColor("Green")
      .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
      .setImage("https://i.ibb.co.com/Y0C1Zcw/tenor.gif")
      .setTimestamp();

    await message.channel.send({ embeds: [winnerEmbed] });

    giveaway.ended = true;
    await giveaway.save();
  }
}

function getRandomIdFromJson(jsonData) {
  const idArray = JSON.parse(jsonData);
  const randomIndex = Math.floor(Math.random() * idArray.length);
  return idArray[randomIndex];
}
