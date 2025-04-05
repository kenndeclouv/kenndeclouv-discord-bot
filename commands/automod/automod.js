const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
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
        .setName("antibadwords")
        .setDescription("Aktifkan atau nonaktifkan ban kata kata kasar")
        .addStringOption((option) => option.setName("status").setDescription("Aktifkan atau nonaktifkan").setRequired(true).addChoices({ name: "Aktifkan", value: "enable" }, { name: "Nonaktifkan", value: "disable" }))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("whitelist")
        .setDescription("Tambahkan atau hapus pengguna/peran dari daftar yang diperbolehkan automod")
        .addStringOption((option) => option.setName("action").setDescription("Tambahkan atau hapus").setRequired(true).addChoices({ name: "Tambahkan", value: "add" }, { name: "Hapus", value: "remove" }))
        .addMentionableOption((option) => option.setName("target").setDescription("Pengguna atau peran untuk ditambahkan/dihapus dari daftar yang diperbolehkan").setRequired(true))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("badwords")
        .setDescription("Tambahkan atau hapus kata kata kasar yang dilarang dalam server")
        .addStringOption((option) => option.setName("action").setDescription("Tambahkan atau hapus").setRequired(true).addChoices({ name: "Tambahkan", value: "add" }, { name: "Hapus", value: "remove" }))
        .addStringOption((option) => option.setName("word").setDescription("Kata kata").setRequired(true))
    )
    .addSubcommand((subcommand) => subcommand.setName("badwords-list").setDescription("Lihat daftar yang diperbolehkan automod"))
    .addSubcommand((subcommand) =>
      subcommand
        .setName("leveling")
        .setDescription("Aktifkan atau nonaktifkan sistem leveling")
        .addStringOption((option) => option.setName("status").setDescription("Aktifkan atau nonaktifkan").setRequired(true).addChoices({ name: "Aktifkan", value: "enable" }, { name: "Nonaktifkan", value: "disable" }))
    ),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    try {
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
          autoModSettings.antiInvites = status === "enable";
          await autoModSettings.save();
          embed.setDescription(`Deteksi tautan undangan telah ${status === "enable" ? "diaktifkan" : "dinonaktifkan"}.`);
          return interaction.editReply({ embeds: [embed] });
        }
        case "antilinks": {
          autoModSettings.antiLinks = status === "enable";
          await autoModSettings.save();
          embed.setDescription(`Deteksi tautan telah ${status === "enable" ? "diaktifkan" : "dinonaktifkan"}.`);
          return interaction.editReply({ embeds: [embed] });
        }
        case "antispam": {
          autoModSettings.antiSpam = status === "enable";
          await autoModSettings.save();
          embed.setDescription(`Deteksi spam telah ${status === "enable" ? "diaktifkan" : "dinonaktifkan"}.`);
          return interaction.editReply({ embeds: [embed] });
        }
        case "antibadwords": {
          autoModSettings.antiBadwords = status === "enable";
          await autoModSettings.save();
          embed.setDescription(`Deteksi kata kasar telah ${status === "enable" ? "diaktifkan" : "dinonaktifkan"}.`);
          return interaction.editReply({ embeds: [embed] });
        }
        case "whitelist": {
          const targetId = target.id;
          console.log("Data awal whitelist dari database:", autoModSettings.whitelist);
          let whitelist = autoModSettings.whitelist;

          if (!Array.isArray(whitelist) && typeof whitelist === "string") {
            console.log("Whitelist adalah string JSON, mencoba parse...");
            try {
              whitelist = JSON.parse(whitelist); // ubah string jadi array
            } catch (error) {
              console.error("Gagal parse whitelist JSON, reset ke array kosong.", error);
              whitelist = [];
            }
          } else if (!Array.isArray(whitelist)) {
            console.log("Whitelist bukan array atau JSON, reset ke array kosong.");
            whitelist = [];
          }

          if (action === "add") {
            if (whitelist.includes(targetId)) {
              embed.setDescription("Pengguna/peran ini sudah ada dalam daftar diperbolehkan.");
              return interaction.editReply({ embeds: [embed] });
            }
            whitelist.push(targetId); // tambah data baru
            autoModSettings.whitelist = whitelist; // update field whitelist
            autoModSettings.changed("whitelist", true); // pastikan Sequelize tahu ada perubahan
            await autoModSettings.save(); // simpan ke database
            embed.setDescription(interaction.guild.members.cache.get(targetId) ? `Ditambahkan user <@${targetId}> ke daftar diperbolehkan.` : `Ditambahkan role <@&${targetId}> ke daftar diperbolehkan.`);
            return interaction.editReply({ embeds: [embed] });
          } else if (action === "remove") {
            if (!whitelist.includes(targetId)) {
              embed.setDescription("Pengguna/peran ini tidak ada dalam daftar diperbolehkan.");
              return interaction.editReply({ embeds: [embed] });
            }
            whitelist = whitelist.filter((id) => id !== targetId); // hapus data
            autoModSettings.whitelist = whitelist; // update field whitelist
            autoModSettings.changed("whitelist", true); // pastikan Sequelize tahu ada perubahan
            await autoModSettings.save(); // simpan ke database
            embed.setDescription(interaction.guild.members.cache.get(targetId) ? `Dihapus user <@${targetId}> dari daftar diperbolehkan.` : `Dihapus role <@&${targetId}> dari daftar diperbolehkan.`);
            return interaction.editReply({ embeds: [embed] });
          }
        }

        case "leveling": {
          autoModSettings.leveling = status === "enable";
          await autoModSettings.save();
          embed.setDescription(`Sistem leveling telah ${status === "enable" ? "diaktifkan" : "dinonaktifkan"}.`);
          return interaction.editReply({ embeds: [embed] });
        }

        case "whitelist-list": {
          // Pastikan whitelist adalah array yang valid
          let whitelist = autoModSettings.whitelist;

          // Jika whitelist bukan array, coba parse menjadi array
          if (typeof whitelist === "string") {
            whitelist = JSON.parse(whitelist);
          }

          if (!Array.isArray(whitelist)) {
            whitelist = []; // fallback ke array kosong jika parsing gagal
          }

          if (whitelist.length === 0) {
            embed.setDescription("daftar yang diperbolehkan automod kosong.");
            return interaction.editReply({ embeds: [embed] });
          }

          const whitelistString = whitelist
            .map((id) => {
              const member = interaction.guild.members.cache.get(id);
              if (member) {
                return `<@${id}>`;
              }
              const role = interaction.guild.roles.cache.get(id);
              if (role) {
                return `<@&${id}>`;
              }
              return `ID tidak valid: ${id}`;
            })
            .join("\n");

          embed.setDescription(`daftar yang diperbolehkan automod:\n${whitelistString}`);
          return interaction.editReply({ embeds: [embed] });
        }

        case "badwords": {
          let badwords = autoModSettings.badwords;
        
          if (!Array.isArray(badwords) && typeof badwords === "string") {
            try {
              badwords = JSON.parse(badwords);
            } catch (error) {
              console.error("gagal parse badwords, reset ke array kosong:", error);
              badwords = [];
            }
          } else if (!Array.isArray(badwords)) {
            badwords = [];
          }
        
          const word = interaction.options.getString("word");
          if (!word) {
            embed.setDescription("kata yang ingin ditambahkan atau dihapus harus diisi.");
            return interaction.editReply({ embeds: [embed] });
          }
        
          if (action === "add") {
            if (badwords.includes(word.toLowerCase())) {
              embed.setDescription("kata tersebut sudah ada di daftar badword.");
              return interaction.editReply({ embeds: [embed] });
            }
        
            badwords.push(word.toLowerCase());
            autoModSettings.badwords = badwords;
            autoModSettings.changed("badwords", true);
            await autoModSettings.save();
        
            embed.setDescription(`kata \`${word}\` telah ditambahkan ke daftar badword.`);
            return interaction.editReply({ embeds: [embed] });
          } else if (action === "remove") {
            if (!badwords.includes(word.toLowerCase())) {
              embed.setDescription("kata tersebut tidak ada di daftar badword.");
              return interaction.editReply({ embeds: [embed] });
            }
        
            badwords = badwords.filter((w) => w !== word.toLowerCase());
            autoModSettings.badwords = badwords;
            autoModSettings.changed("badwords", true);
            await autoModSettings.save();
        
            embed.setDescription(`kata \`${word}\` telah dihapus dari daftar badword.`);
            return interaction.editReply({ embeds: [embed] });
          }
          break;
        }
        case "badwords-list": {
          let badwords = autoModSettings.badwords;
        
          if (typeof badwords === "string") {
            try {
              badwords = JSON.parse(badwords);
            } catch (err) {
              console.error("gagal parse badwords:", err);
              badwords = [];
            }
          }
        
          if (!Array.isArray(badwords)) {
            badwords = [];
          }
        
          if (badwords.length === 0) {
            embed.setDescription("daftar kata kasar automod kosong.");
            return interaction.editReply({ embeds: [embed] });
          }
        
          const badwordsString = badwords.map((w) => `• \`${w}\``).join("\n");
        
          embed.setDescription(`daftar kata kasar automod:\n${badwordsString}`);
          return interaction.editReply({ embeds: [embed] });
        }        
      }
    } catch (error) {
      console.error("Error during automod command execution:", error);
      return interaction.editReply({ content: "❌ Terjadi kesalahan saat menjalankan perintah ini. Silakan coba lagi." });
    }
  },
};
