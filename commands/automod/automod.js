const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const AutoMod = require("../../database/models/automod"); // Assuming you have the AutoMod model
const checkPermission = require("../../helpers/checkPermission");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("automod")
    .setDescription("Konfigurasi pengaturan automod")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("antiinvites")
        .setDescription("Aktifkan atau nonaktifkan deteksi tautan undangan")
        .addStringOption((option) => option.setName("status").setDescription("Aktifkan atau nonaktifkan").setRequired(true).addChoices({ name: "Aktifkan", value: "enable" }, { name: "Nonaktifkan", value: "disable" }))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("antilinks")
        .setDescription("Aktifkan atau nonaktifkan deteksi tautan umum")
        .addStringOption((option) => option.setName("status").setDescription("Aktifkan atau nonaktifkan").setRequired(true).addChoices({ name: "Aktifkan", value: "enable" }, { name: "Nonaktifkan", value: "disable" }))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("antispam")
        .setDescription("Aktifkan atau nonaktifkan deteksi spam")
        .addStringOption((option) => option.setName("status").setDescription("Aktifkan atau nonaktifkan").setRequired(true).addChoices({ name: "Aktifkan", value: "enable" }, { name: "Nonaktifkan", value: "disable" }))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("whitelist")
        .setDescription("Tambahkan atau hapus pengguna/peran dari daftar putih automod")
        .addStringOption((option) => option.setName("action").setDescription("Tambahkan atau hapus").setRequired(true).addChoices({ name: "Tambahkan", value: "add" }, { name: "Hapus", value: "remove" }))
        .addMentionableOption((option) => option.setName("target").setDescription("Pengguna atau peran untuk ditambahkan/dihapus dari daftar putih").setRequired(true))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("leveling")
        .setDescription("Aktifkan atau nonaktifkan sistem leveling")
        .addStringOption((option) => option.setName("status").setDescription("Aktifkan atau nonaktifkan").setRequired(true).addChoices({ name: "Aktifkan", value: "enable" }, { name: "Nonaktifkan", value: "disable" }))
    ),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true }); // Always defer reply before answering

    if (!checkPermission(interaction.member)) {
      return interaction.editReply({ content: "❌ Kamu tidak punya izin untuk menggunakan perintah ini." });
    }
    const guildId = interaction.guild.id;
    const subcommand = interaction.options.getSubcommand();
    const status = interaction.options.getString("status");
    const action = interaction.options.getString("action");
    const target = interaction.options.getMentionable("target");

    // Fetch or create automod settings for the guild
    let autoModSettings = await AutoMod.findOne({ where: { guildId: guildId } });
    if (!autoModSettings) {
      autoModSettings = new AutoMod({ guildId: guildId });
      await autoModSettings.save();
    }

    const embed = new EmbedBuilder().setTitle("> AutoMod").setColor("Blue").setThumbnail(interaction.client.user.displayAvatarURL()).setFooter({ text: "Sistem", iconURL: interaction.client.user.displayAvatarURL() }).setTimestamp();

    switch (subcommand) {
      case "antiinvites": {
        // Aktifkan atau nonaktifkan deteksi tautan undangan
        if (status === "enable") {
          autoModSettings.antiInvites = true;
          await autoModSettings.save();
          embed.setDescription("Deteksi tautan undangan telah diaktifkan.");
          return interaction.editReply({ embeds: [embed] });
        } else {
          autoModSettings.antiInvites = false;
          await autoModSettings.save();
          embed.setDescription("Deteksi tautan undangan telah dinonaktifkan.");
          return interaction.editReply({ embeds: [embed] });
        }
      }

      case "antilinks": {
        // Aktifkan atau nonaktifkan deteksi tautan umum
        if (status === "enable") {
          autoModSettings.antiLinks = true;
          await autoModSettings.save();
          embed.setDescription("Deteksi tautan telah diaktifkan.");
          return interaction.editReply({ embeds: [embed] });
        } else {
          autoModSettings.antiLinks = false;
          await autoModSettings.save();
          embed.setDescription("Deteksi tautan telah dinonaktifkan.");
          return interaction.editReply({ embeds: [embed] });
        }
      }

      case "antispam": {
        // Aktifkan atau nonaktifkan deteksi spam
        if (status === "enable") {
          autoModSettings.antiSpam = true;
          await autoModSettings.save();
          embed.setDescription("Deteksi spam telah diaktifkan.");
          return interaction.editReply({ embeds: [embed] });
        } else {
          autoModSettings.antiSpam = false;
          await autoModSettings.save();
          embed.setDescription("Deteksi spam telah dinonaktifkan.");
          return interaction.editReply({ embeds: [embed] });
        }
      }

      case "whitelist": {
        // Tambahkan atau hapus pengguna/peran dari daftar diperbolehkan
        const targetId = target.id;
        let whitelist = autoModSettings.whitelist || [];

        if (action === "add") {
          if (whitelist.includes(targetId)) {
            embed.setDescription("Pengguna/peran ini sudah ada dalam daftar diperbolehkan.");
            return interaction.editReply({ embeds: [embed] });
          }
          whitelist.push(targetId);
          autoModSettings.whitelist = whitelist;
          await autoModSettings.save();
          embed.setDescription(`Ditambahkan <@${targetId}> ke daftar diperbolehkan.`);
          return interaction.editReply({ embeds: [embed] });
        } else if (action === "remove") {
          const index = whitelist.indexOf(targetId);
          if (index === -1) {
            embed.setDescription("Pengguna/peran ini tidak ada dalam daftar diperbolehkan.");
            return interaction.editReply({ embeds: [embed] });
          }
          whitelist.splice(index, 1);
          autoModSettings.whitelist = whitelist;
          await autoModSettings.save();
          embed.setDescription(`Dihapus <@${targetId}> dari daftar diperbolehkan.`);
          return interaction.editReply({ embeds: [embed] });
        }
      }

      case "leveling": {
        if (status == "enable") {
          autoModSettings.leveling = true;
          await autoModSettings.save();
          embed.setDescription("Sistem leveling telah diaktifkan.");
          return interaction.editReply({ embeds: [embed] });
        } else {
          autoModSettings.leveling = false;
          await autoModSettings.save();
          embed.setDescription("Sistem leveling telah dinonaktifkan.");
          return interaction.editReply({ embeds: [embed] });
        }
      }
    }
  },
};
