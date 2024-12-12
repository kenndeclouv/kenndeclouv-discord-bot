const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
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
    if (!checkPermission(interaction.member)) {
      return interaction.reply({ content: "❌ Kamu tidak punya izin untuk menggunakan perintah ini.", ephemeral: true });
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

    switch (subcommand) {
      case "antiinvites": {
        // Aktifkan atau nonaktifkan deteksi tautan undangan
        if (status === "enable") {
          autoModSettings.antiInvites = true;
          await autoModSettings.save();
          return interaction.reply({ content: "Deteksi tautan undangan telah diaktifkan.", ephemeral: true });
        } else {
          autoModSettings.antiInvites = false;
          await autoModSettings.save();
          return interaction.reply({ content: "Deteksi tautan undangan telah dinonaktifkan.", ephemeral: true });
        }
      }

      case "antilinks": {
        // Aktifkan atau nonaktifkan deteksi tautan umum
        if (status === "enable") {
          autoModSettings.antiLinks = true;
          await autoModSettings.save();
          return interaction.reply({ content: "Deteksi tautan telah diaktifkan.", ephemeral: true });
        } else {
          autoModSettings.antiLinks = false;
          await autoModSettings.save();
          return interaction.reply({ content: "Deteksi tautan telah dinonaktifkan.", ephemeral: true });
        }
      }

      case "antispam": {
        // Aktifkan atau nonaktifkan deteksi spam
        if (status === "enable") {
          autoModSettings.antiSpam = true;
          await autoModSettings.save();
          return interaction.reply({ content: "Deteksi spam telah diaktifkan.", ephemeral: true });
        } else {
          autoModSettings.antiSpam = false;
          await autoModSettings.save();
          return interaction.reply({ content: "Deteksi spam telah dinonaktifkan.", ephemeral: true });
        }
      }

      case "whitelist": {
        // Tambahkan atau hapus pengguna/peran dari daftar diperbolehkan
        const targetId = target.id;
        let whitelist = autoModSettings.whitelist || [];

        if (action === "add") {
          if (whitelist.includes(targetId)) {
            return interaction.reply({ content: "Pengguna/peran ini sudah ada dalam daftar diperbolehkan.", ephemeral: true });
          }
          whitelist.push(targetId);
          autoModSettings.whitelist = whitelist;
          await autoModSettings.save();
          return interaction.reply({ content: `Ditambahkan <@${targetId}> ke daftar diperbolehkan.`, ephemeral: true });
        } else if (action === "remove") {
          const index = whitelist.indexOf(targetId);
          if (index === -1) {
            return interaction.reply({ content: "Pengguna/peran ini tidak ada dalam daftar diperbolehkan.", ephemeral: true });
          }
          whitelist.splice(index, 1);
          autoModSettings.whitelist = whitelist;
          await autoModSettings.save();
          return interaction.reply({ content: `Dihapus <@${targetId}> dari daftar diperbolehkan.`, ephemeral: true });
        }
      }

      case "leveling": {
        if (status == "enable") {
          autoModSettings.leveling = true;
          await autoModSettings.save();
          return interaction.reply({ content: "Sistem leveling telah diaktifkan.", ephemeral: true });
        } else {
          autoModSettings.leveling = false;
          await autoModSettings.save();
          return interaction.reply({ content: "Sistem leveling telah dinonaktifkan.", ephemeral: true });
        }
      }
    }
  },
};
